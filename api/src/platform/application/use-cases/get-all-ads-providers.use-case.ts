import { Inject, Injectable } from '@nestjs/common';
import { ADS_PROVIDER_REPOSITORY, AdsProviderRepositoryInterface } from '@/platform/domain/repositories/ads-provider.repository.interface';

@Injectable()
export class GetAllAdsProvidersUseCase {
  constructor(
    @Inject(ADS_PROVIDER_REPOSITORY)
    private readonly repo: AdsProviderRepositoryInterface,
  ) {}

  async execute() {
    const providers = await this.repo.findAll();
    return providers.map((p) => p.toPrimitives());
  }
}
