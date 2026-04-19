import { Injectable } from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class GetMyProfileUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async execute(request: Request) {
    const user = request.user;

    const monetizationPaidAccountEnabledRaw =
      await this.settingsService.findValueByName(
        'monetizationPaidAccountEnabled',
        false,
      );
    const monetizationPaidAccountEnabled =
      monetizationPaidAccountEnabledRaw === 'true' ||
      monetizationPaidAccountEnabledRaw === true;

    const purchase = await this.prisma.purchase.findFirst({
      where: {
        userId: user.id,
        status: 'completed',
        publicationId: null,
        tutorialId: null,
      },
    });

    const isPaid = user.isSuperAdmin || !!purchase;

    return {
      id: user.id,
      avatarUrl: user.avatarUrl,
      username: user.username,
      name: user.name,
      jobTitle: user.jobTitle,
      bio: user.bio,
      location: user.location,
      isPaid: monetizationPaidAccountEnabled ? isPaid : true,
      role: {
        type: (user as any).role.type,
        name: (user as any).role.name,
      },
    };
  }
}
