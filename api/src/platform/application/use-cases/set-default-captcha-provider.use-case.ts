import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CAPTCHA_PROVIDER_REPOSITORY,
  CaptchaProviderRepositoryInterface,
} from '@/platform/domain/repositories/captcha-provider.repository.interface';

@Injectable()
export class SetDefaultCaptchaProviderUseCase {
  constructor(
    @Inject(CAPTCHA_PROVIDER_REPOSITORY)
    private readonly repo: CaptchaProviderRepositoryInterface,
  ) {}

  async execute(type: string) {
    const provider = await this.repo.findByType(type);
    if (!provider) {
      throw new NotFoundException('Captcha provider not found');
    }

    if (!provider.isConfigured) {
      throw new BadRequestException('Captcha provider must be configured before it can be set as default');
    }

    await this.repo.setDefault(type);
    return { success: true };
  }
}
