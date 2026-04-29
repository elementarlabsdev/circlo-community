import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { CreateComplaintDto } from '../dto/create-complaint.dto';
import { User } from '@prisma/client';
import { ComplaintNotificationService } from './complaint-notification.service';
import { Complaint } from '@/complaints/domain/entities/complaint.entity';
import {
  COMPLAINT_REPOSITORY,
  ComplaintRepository,
} from '@/complaints/domain/repositories/complaint.repository.interface';
import { Inject } from '@nestjs/common';
import {
  COMPLAINTS_TARGET_VALIDATOR,
  ComplaintsTargetValidator,
} from '@/complaints/domain/services/complaints-target-validator.interface';
import { ConfigService } from '@nestjs/config';
import { CaptchaValidationService } from '@/identity/application/services/captcha-validation.service';

@Injectable()
export class ComplaintsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(COMPLAINT_REPOSITORY)
    private readonly complaintsRepo: ComplaintRepository,
    @Inject(COMPLAINTS_TARGET_VALIDATOR)
    private readonly targetValidator: ComplaintsTargetValidator,
    private readonly notifications: ComplaintNotificationService,
    private readonly captchaValidation: CaptchaValidationService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateComplaintDto, reporter?: User, remoteIp?: string) {
    const targetType = dto.targetType.toLowerCase();

    // Validate supported type and target existence
    const isSupported = this.targetValidator
      .supportedTypes()
      .includes(targetType);
    if (!isSupported) {
      throw new BadRequestException(
        await this.i18n.t('common.errors.unsupported_target_type', {
          args: { targetType: dto.targetType },
        }),
      );
    }
    const exists = await this.targetValidator.validateExists(
      targetType,
      dto.targetId,
    );
    if (!exists) {
      throw new NotFoundException(await this.i18n.t('common.errors.not_found'));
    }

    // Validate reason code exists
    const reason = await this.prisma.complaintReason.findUnique({
      where: { code: dto.reason },
      select: { id: true },
    });
    if (!reason) {
      throw new BadRequestException(
        await this.i18n.t('common.errors.unknown_complaint_reason'),
      );
    }

    // Validate reportedUrl belongs to our HOST_URL origin if provided
    if (dto.reportedUrl) {
      try {
        const reportedOrigin = new URL(dto.reportedUrl).origin;
        const hostEnv = this.configService.get<string>('HOST_URL');
        if (hostEnv) {
          const hostOrigin = new URL(hostEnv).origin;
          if (reportedOrigin !== hostOrigin) {
            throw new BadRequestException(
              await this.i18n.t('common.errors.reported_url_invalid'),
            );
          }
        }
      } catch (e) {
        // Invalid URL string or origin mismatch already thrown
        if (e instanceof BadRequestException) throw e;
        throw new BadRequestException(
          await this.i18n.t('common.errors.reported_url_not_valid'),
        );
      }
    }

    // For anonymous users, verify captcha token
    if (!reporter?.id) {
      await this.captchaValidation.validate(
        {
          captchaToken: dto.captchaToken,
          recaptchaToken: dto.recaptchaToken,
        },
        remoteIp,
      );
      // After successful captcha, ensure idempotency per IP + target
      if (remoteIp) {
        const existing = await this.prisma.complaint.findFirst({
          where: {
            reporterId: null,
            reporterIp: remoteIp,
            targetType,
            targetId: dto.targetId,
          },
          include: {
            attachments: true,
            reason: { select: { id: true, code: true, name: true } },
            status: { select: { id: true, code: true, name: true } },
            internalNotes: true,
          },
        });
        if (existing) {
          // Re-trigger notification for existing complaint if the user complains again
          this.notifications
            .notifyComplaintCreated({ complaintId: existing.id })
            .catch(() => void 0);
          return existing as any;
        }
      }
    }

    // Prevent duplicates for logged-in users proactively
    if (reporter?.id) {
      const alreadyExists = await this.complaintsRepo.existsByReporterAndTarget(
        reporter.id,
        targetType,
        dto.targetId,
      );
      if (alreadyExists) {
        // Behave as if created: return existing complaint record
        const existing = await this.prisma.complaint.findFirst({
          where: {
            reporterId: reporter.id,
            targetType,
            targetId: dto.targetId,
          },
          include: {
            attachments: true,
            reason: { select: { id: true, code: true, name: true } },
            status: { select: { id: true, code: true, name: true } },
            internalNotes: true,
          },
        });

        if (existing) {
          // Re-trigger notification for existing complaint if the user complains again
          this.notifications
            .notifyComplaintCreated({ complaintId: existing.id })
            .catch(() => void 0);
        }

        return existing as any;
      }
    }

    try {
      // Calculate complaint number
      const count = await this.prisma.complaint.count();
      const complaintName = `Complaint #${count + 1}`;

      // Create domain entity and persist through repository
      const complaintEntity = Complaint.create({
        name: complaintName,
        targetType,
        targetId: dto.targetId,
        reporterId: reporter?.id ?? null,
        reporterIp: remoteIp ?? null,
        reportedUrl: dto.reportedUrl,
        reason: dto.reason,
        details: dto.details,
        attachmentIds: [],
      });
      const saved = await this.complaintsRepo.create(complaintEntity);
      // fire-and-forget notification
      this.notifications
        .notifyComplaintCreated({ complaintId: saved.id })
        .catch(() => void 0);

      // Load fresh from DB with reason relation and attachments for response
      const full = await this.prisma.complaint.findUnique({
        where: { id: saved.id },
        include: {
          attachments: true,
          reason: { select: { id: true, code: true, name: true } },
          status: { select: { id: true, code: true, name: true } },
          internalNotes: true,
        },
      });
      // Should exist because we just created
      return full as any;
    } catch (e: any) {
      // Unique constraint violation for (reporterId, targetType, targetId)
      if (e?.code === 'P2002' && reporter?.id) {
        // Behave as if created: return existing complaint
        const existing = await this.prisma.complaint.findFirst({
          where: {
            reporterId: reporter.id,
            targetType,
            targetId: dto.targetId,
          },
          include: {
            attachments: true,
            reason: { select: { id: true, code: true, name: true } },
            status: { select: { id: true, code: true, name: true } },
            internalNotes: true,
          },
        });

        if (existing) {
          // Re-trigger notification for existing complaint if the user complains again
          this.notifications
            .notifyComplaintCreated({ complaintId: existing.id })
            .catch(() => void 0);
        }

        return existing as any;
      }
      throw e;
    }
  }

  async adminList(params: {
    skip?: number;
    take?: number;
    targetType?: string;
    reason?: string;
  }) {
    const { skip = 0, take = 20, targetType, reason } = params;
    const rows = await this.prisma.complaint.findMany({
      where: {
        ...(targetType ? { targetType: targetType.toLowerCase() } : {}),
        ...(reason ? { reason: { code: reason } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        attachments: true,
        reporter: { select: { id: true, name: true, email: true } },
        reason: { select: { id: true, code: true, name: true } },
        status: { select: { id: true, code: true, name: true } },
        internalNotes: true,
      },
    });
    return rows as any;
  }

  async adminFindById(id: string) {
    const r = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        attachments: true,
        reporter: { select: { id: true, name: true, email: true } },
        reason: { select: { id: true, code: true, name: true } },
        status: { select: { id: true, code: true, name: true } },
        internalNotes: true,
      },
    });
    if (!r) throw new NotFoundException('Complaint not found');
    return r as any;
  }

  async adminDelete(id: string) {
    return await this.complaintsRepo.delete(id);
  }
}
