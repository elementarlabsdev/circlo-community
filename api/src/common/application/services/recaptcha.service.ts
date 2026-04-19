import { Injectable, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '@/settings/application/services/settings.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

type VerifyResponse = {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
};

@Injectable()
export class RecaptchaService {
  constructor(
    private readonly httpService: HttpService,
    private readonly settingsService: SettingsService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async verifyToken(
    token: string,
    remoteIp?: string,
    minScore = 0.5,
  ): Promise<void> {
    // In development mode, bypass recaptcha verification entirely
    const env = this.configService.get<string>('ENV');

    if (env === 'dev' || env === 'development') {
      return;
    }

    const secretKey =
      await this.settingsService.findValueByName('recaptchaSecretKey');

    if (!secretKey) {
      throw new UnauthorizedException(
        await this.i18n.t('common.errors.captcha_failed'),
      );
    }

    const response = await lastValueFrom(
      this.httpService.post(
        `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      ),
    );

    const data = response.data;

    if (
      !data.success ||
      (typeof data.score === 'number' && data.score < minScore)
    ) {
      throw new UnauthorizedException(
        await this.i18n.t('common.errors.captcha_failed'),
      );
    }
  }
}
