import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/platform/application/services/prisma.service';
import {
  EMAIL_CHANGE_REPOSITORY,
  EmailChangeRepositoryInterface,
} from '../../domain/repositories/email-change-repository.interface';

@Injectable()
export class ConfirmEmailChangeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_CHANGE_REPOSITORY)
    private readonly repo: EmailChangeRepositoryInterface,
  ) {}

  async execute(userId: string, code: string) {
    const change = await this.repo.findByUserId(userId);
    if (!change) {
      throw new BadRequestException('NO_PENDING_EMAIL_CHANGE');
    }
    if (change.isExpired()) {
      await this.repo.deleteByUserId(userId);
      throw new BadRequestException('CODE_EXPIRED');
    }
    const isValid = await bcrypt.compare(code, change.codeHash);
    if (!isValid) {
      throw new BadRequestException('INVALID_CODE');
    }
    // Make sure email still not taken (race condition)
    const taken = await this.prisma.user.findUnique({
      where: { email: change.newEmail },
    });
    if (taken) {
      await this.repo.deleteByUserId(userId);
      throw new BadRequestException('EMAIL_ALREADY_IN_USE');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { email: change.newEmail },
    });
    await this.repo.deleteByUserId(userId);
    return { ok: true };
  }
}
