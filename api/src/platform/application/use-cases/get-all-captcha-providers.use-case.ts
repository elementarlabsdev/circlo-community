import { Inject, Injectable } from '@nestjs/common';
import {
  CAPTCHA_PROVIDER_REPOSITORY,
  CaptchaProviderRepositoryInterface,
} from '@/platform/domain/repositories/captcha-provider.repository.interface';

@Injectable()
export class GetAllCaptchaProvidersUseCase {
  constructor(
    @Inject(CAPTCHA_PROVIDER_REPOSITORY)
    private readonly repo: CaptchaProviderRepositoryInterface,
  ) {}

  async execute() {
    const providers = await this.repo.findAll();
    return providers.map((p) => p.toPrimitives());
  }
}
