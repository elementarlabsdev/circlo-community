import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CAPTCHA_PROVIDER_REPOSITORY,
  CaptchaProviderRepositoryInterface,
} from '@/platform/domain/repositories/captcha-provider.repository.interface';
import { CapJsService } from '@/common/application/services/capjs.service';

@Injectable()
export class UpdateCaptchaProviderUseCase {
  constructor(
    @Inject(CAPTCHA_PROVIDER_REPOSITORY)
    private readonly repo: CaptchaProviderRepositoryInterface,
    private readonly capJsService: CapJsService,
  ) {}

  async execute(
    type: string,
    data: { siteKey?: string; secretKey?: string; isConfigured?: boolean },
  ) {
    const provider = await this.repo.findByType(type);
    if (!provider) {
      throw new NotFoundException('Captcha provider not found');
    }

    provider.update(data);

    if (type === 'local' && provider.siteKey && provider.secretKey) {
      // Manual registration in Cap dashboard is required for version 2.x
    }

    const providers = await this.repo.findAll();
    const hasDefault = providers.some((p) => p.isDefault);

    if (!hasDefault) {
      provider.update({ isDefault: true });
    }

    await this.repo.save(provider);
    return provider.toPrimitives();
  }
}
