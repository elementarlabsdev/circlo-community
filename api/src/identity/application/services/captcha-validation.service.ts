import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  CAPTCHA_PROVIDER_REPOSITORY,
  CaptchaProviderRepositoryInterface,
} from '@/platform/domain/repositories/captcha-provider.repository.interface';
import { CapJsService } from '@/common/application/services/capjs.service';
import { RecaptchaService } from '@/common/application/services/recaptcha.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CaptchaValidationService {
  constructor(
    @Inject(CAPTCHA_PROVIDER_REPOSITORY)
    private readonly captchaProviderRepository: CaptchaProviderRepositoryInterface,
    private readonly capjs: CapJsService,
    private readonly recaptcha: RecaptchaService,
    private readonly i18n: I18nService,
  ) {}

  async validate(
    tokens: { captchaToken?: string; recaptchaToken?: string },
    remoteIp?: string,
  ): Promise<void> {
    const captchaProviders = await this.captchaProviderRepository.findAll();
    const defaultCaptcha = captchaProviders.find((p) => p.isDefault);

    if (defaultCaptcha) {
      if (defaultCaptcha.type === 'local') {
        if (!tokens.captchaToken) {
          throw new BadRequestException(
            await this.i18n.t('common.errors.captcha_required'),
          );
        }
        await this.capjs.verifyToken(tokens.captchaToken);
      } else if (defaultCaptcha.type === 'recaptcha') {
        if (!tokens.recaptchaToken) {
          throw new BadRequestException(
            await this.i18n.t('common.errors.captcha_required'),
          );
        }
        await this.recaptcha.verifyToken(tokens.recaptchaToken, remoteIp);
      }
    }
  }
}
