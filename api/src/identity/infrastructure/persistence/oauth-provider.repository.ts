import { Injectable } from '@nestjs/common';
import { OAuthProvider } from '../../domain/entities/oauth-provider.entity';
import { OAuthProviderRepositoryInterface } from '../../domain/repositories/oauth-provider.repository.interface';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class OAuthProviderRepository
  implements OAuthProviderRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<OAuthProvider[]> {
    const providersFromDb = await this.prisma.oAuthProvider.findMany({
      where: { isEnabled: true, isConfigured: true },
      orderBy: { position: 'asc' },
    });
    return providersFromDb.map(
      (p) => new OAuthProvider(p.type, p.name, p.iconUrl ?? undefined),
    );
  }
}
