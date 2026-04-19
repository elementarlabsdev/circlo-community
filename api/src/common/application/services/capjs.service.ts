import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  CAPTCHA_PROVIDER_REPOSITORY,
  CaptchaProviderRepositoryInterface,
} from '@/platform/domain/repositories/captcha-provider.repository.interface';

@Injectable()
export class CapJsService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(CAPTCHA_PROVIDER_REPOSITORY)
    private readonly captchaProviderRepo: CaptchaProviderRepositoryInterface,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async verifyToken(token: string): Promise<void> {
    const env = this.configService.get<string>('ENV');

    if (env === 'dev' || env === 'development') {
      return;
    }

    const provider = await this.captchaProviderRepo.findByType('local');
    const secretKey = provider?.secretKey;
    const siteKey = provider?.siteKey;

    if (!provider.isConfigured) {
      // If not configured, maybe we allow or fallback,
      // but for security it's better to throw if CAP is intended to be used.
      return;
    }

    const captchaHostUrl = 'http://cap:3001';

    try {
      const response = await lastValueFrom(
        this.httpService.post(`${captchaHostUrl}/${siteKey}/siteverify`, {
          secret: secretKey,
          response: token,
        }),
      );

      if (!response.data.success) {
        throw new UnauthorizedException(
          await this.i18n.t('common.errors.captcha_failed'),
        );
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        await this.i18n.t('common.errors.captcha_failed'),
      );
    }
  }

  async registerSite(siteKey: string, secretKey: string): Promise<void> {
    const adminKey = this.configService.get<string>('CAP_ADMIN_KEY');
    if (!adminKey) {
      return;
    }

    const captchaHostUrl =
      this.configService.get<string>('CAPTCHA_HOST_URL') || 'http://cap:3001';

    try {
      await lastValueFrom(
        this.httpService.post(
          `${captchaHostUrl}/api/site`,
          {
            site_key: siteKey,
            secret_key: secretKey,
          },
          {
            headers: {
              Authorization: `Bearer ${adminKey}`,
            },
          },
        ),
      );
    } catch (error) {
      console.error('Failed to register site in CapJS service', error);
    }
  }
}
