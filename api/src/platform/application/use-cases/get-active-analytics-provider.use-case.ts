import { Inject, Injectable } from '@nestjs/common';
import { ANALYTICS_PROVIDER_REPOSITORY, AnalyticsProviderRepositoryInterface } from '@/platform/domain/repositories/analytics-provider.repository.interface';

@Injectable()
export class GetActiveAnalyticsProviderUseCase {
  constructor(
    @Inject(ANALYTICS_PROVIDER_REPOSITORY)
    private readonly repo: AnalyticsProviderRepositoryInterface,
  ) {}

  async execute() {
    const providers = await this.repo.findAll();
    const active = providers.find((p) => p.isEnabled && p.isConfigured);
    return active ? active.toPrimitives() : null;
  }
}
