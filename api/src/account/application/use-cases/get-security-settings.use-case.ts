import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class GetSecuritySettingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, email: string) {
    const securitySettings = await this.prisma.securitySettings.findUnique({
      where: { userId },
    });
    const oauthProviders = await this.prisma.userOAuthLoginProvider.findMany({
      where: { userId },
    });
    return {
      email,
      securitySettings,
      oauthProviders,
    };
  }
}
