import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as passport from 'passport';
import { Strategy as XStrategyLib } from 'passport-twitter';

@Injectable()
export class XOauthGuard extends AuthGuard('twitter') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const row = await this.prisma.oAuthProvider.findUnique({
      where: { type: 'x' },
    });

    let consumerKey = this.configService.get<string>('X_CONSUMER_KEY');
    let consumerSecret = this.configService.get<string>('X_CONSUMER_SECRET');
    let callbackURL = this.configService.get<string>('X_CALLBACK_URL');

    if (row && row.isEnabled && row.isConfigured) {
      const cfg = (row as any).config ?? {};
      consumerKey = cfg.consumerKey || cfg.clientId || consumerKey;
      consumerSecret = cfg.consumerSecret || cfg.clientSecret || consumerSecret;
      const hostUrl = this.configService.get<string>('BACKEND_HOST_URL');
      const defaultCallback = `${hostUrl}/api/v1/oauth/x/callback`;
      callbackURL =
        cfg.callbackURL || cfg.callbackUrl || callbackURL || defaultCallback;
    }

    if (!consumerKey || !consumerSecret) {
      throw new Error('X (Twitter) OAuth is not configured');
    }

    if (!callbackURL) {
      const hostUrl = this.configService.get<string>('BACKEND_HOST_URL');
      callbackURL = `${hostUrl}/api/v1/oauth/x/callback`;
    }

    const strategy = new XStrategyLib(
      {
        consumerKey,
        consumerSecret,
        callbackURL,
        includeEmail: true,
      },
      async (token, tokenSecret, profile, done) => {
        return done(null, profile);
      },
    );

    // Dynamic strategy registration
    (passport as any)._strategies['twitter'] = strategy;

    return super.canActivate(context) as Promise<boolean>;
  }

  getAuthenticateOptions(): Record<string, any> {
    return {
      force_login: true,
    };
  }
}
