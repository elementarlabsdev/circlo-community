import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ADS_PROVIDER_REPOSITORY, AdsProviderRepositoryInterface } from '@/platform/domain/repositories/ads-provider.repository.interface';

@Injectable()
export class UpdateAdsProviderUseCase {
  constructor(
    @Inject(ADS_PROVIDER_REPOSITORY)
    private readonly repo: AdsProviderRepositoryInterface,
  ) {}

  async execute(type: string, data: { isEnabled?: boolean; config?: any | null }): Promise<any> {
    const provider = await this.repo.findByType(type);
    if (!provider) throw new NotFoundException('Ads provider not found');

    provider.update({
      isEnabled: typeof data.isEnabled === 'boolean' ? data.isEnabled : provider.isEnabled,
      config: data.config !== undefined ? data.config : provider.config,
      isConfigured: true,
    });

    await this.repo.save(provider);
    return provider.toPrimitives();
  }
}
