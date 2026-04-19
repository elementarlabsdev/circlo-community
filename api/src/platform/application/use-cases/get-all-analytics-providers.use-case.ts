import { Inject, Injectable } from '@nestjs/common';
import { ANALYTICS_PROVIDER_REPOSITORY, AnalyticsProviderRepositoryInterface } from '@/platform/domain/repositories/analytics-provider.repository.interface';

@Injectable()
export class GetAllAnalyticsProvidersUseCase {
  constructor(
    @Inject(ANALYTICS_PROVIDER_REPOSITORY)
    private readonly repo: AnalyticsProviderRepositoryInterface,
  ) {}

  async execute() {
    const providers = await this.repo.findAll();
    return providers.map(p => p.toPrimitives());
  }
}
