import { Inject, Injectable } from '@nestjs/common';
import { ADS_PROVIDER_REPOSITORY, AdsProviderRepositoryInterface } from '@/platform/domain/repositories/ads-provider.repository.interface';

@Injectable()
export class GetActiveAdsProviderUseCase {
  constructor(
    @Inject(ADS_PROVIDER_REPOSITORY)
    private readonly repo: AdsProviderRepositoryInterface,
  ) {}

  async execute() {
    const providers = await this.repo.findAll();
    const active = providers.find((p) => p.isEnabled && p.isConfigured);
    return active ? active.toPrimitives() : null;
  }
}
