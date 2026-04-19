import { Injectable } from '@nestjs/common';
import { User as PrismaUser } from '@prisma/client';
import { User } from '@/identity/domain/entities/user.entity';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async execute(user: PrismaUser | User | null) {
    if (!user) return null;

    const monetizationPaidAccountEnabledRaw =
      await this.settingsService.findValueByName(
        'monetizationPaidAccountEnabled',
        false,
      );
    const monetizationPaidAccountEnabled =
      monetizationPaidAccountEnabledRaw === 'true' ||
      monetizationPaidAccountEnabledRaw === true;

    const isPaid =
      !monetizationPaidAccountEnabled ||
      user.isSuperAdmin ||
      (user instanceof User
        ? user.role?.type === 'admin'
        : (user as any).role?.type === 'admin') ||
      user.hasPaidAccount ||
      (user.subscriptionExpiresAt && user.subscriptionExpiresAt > new Date());

    if (user instanceof User) {
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email.value,
        avatarUrl: user.avatarUrl,
        credits: user.counters.credits,
        roleType: user.role?.type,
        roleName: user.role?.name,
        role: user.role,
        hasPaidAccount: user.hasPaidAccount,
        preferredColorScheme: user.preferredColorScheme,
        cookieConsent: user.cookieConsent,
        isPaid,
      };
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      credits: (user as any).credits,
      roleType: user['role']?.type,
      roleName: user['role']?.name,
      role: user['role'],
      hasPaidAccount: (user as any).hasPaidAccount,
      preferredColorScheme: (user as any).preferredColorScheme,
      cookieConsent: (user as any).cookieConsent,
      isPaid,
    };
  }
}
