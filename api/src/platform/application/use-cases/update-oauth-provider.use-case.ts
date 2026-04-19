import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class UpdateOAuthProviderUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(type: string, data: { isEnabled?: boolean; config?: any }) {
    const updated = await this.prisma.oAuthProvider.update({
      where: { type },
      data: {
        isEnabled: typeof data.isEnabled === 'boolean' ? data.isEnabled : undefined,
        isConfigured: true,
        config: data.config ?? undefined,
      },
    });
    return updated;
  }
}
