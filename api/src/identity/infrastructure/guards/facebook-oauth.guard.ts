import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as passport from 'passport';
import { Strategy as FacebookStrategyLib } from 'passport-facebook';

@Injectable()
export class FacebookOauthGuard extends AuthGuard('facebook') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const row = await this.prisma.oAuthProvider.findUnique({
      where: { type: 'facebook' },
    });

    let clientID = this.configService.get<string>('FACEBOOK_CLIENT_ID');
    let clientSecret = this.configService.get<string>('FACEBOOK_CLIENT_SECRET');
    let callbackURL = this.configService.get<string>('FACEBOOK_CALLBACK_URL');
    let profileFields = ['id', 'emails', 'name'];

    if (row && row.isEnabled && row.isConfigured) {
      const cfg = (row as any).config ?? {};
      clientID = cfg.clientId || clientID;
      clientSecret = cfg.clientSecret || clientSecret;
      const hostUrl = this.configService.get<string>('BACKEND_HOST_URL');
      const defaultCallback = `${hostUrl}/api/v1/oauth/facebook/callback`;
      callbackURL =
        cfg.callbackURL || cfg.callbackUrl || callbackURL || defaultCallback;
      profileFields =
        Array.isArray(cfg.profileFields) && cfg.profileFields.length > 0
          ? cfg.profileFields
          : profileFields;
    }

    if (!clientID || !clientSecret) {
      throw new Error('Facebook OAuth is not configured');
    }

    if (!callbackURL) {
      const hostUrl = this.configService.get<string>('BACKEND_HOST_URL');
      callbackURL = `${hostUrl}/api/v1/oauth/facebook/callback`;
    }

    const strategy = new FacebookStrategyLib(
      {
        clientID,
        clientSecret,
        callbackURL,
        profileFields,
        scope: ['email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      },
    );

    // Dynamic strategy registration
    (passport as any)._strategies['facebook'] = strategy;

    return super.canActivate(context) as Promise<boolean>;
  }

  getAuthenticateOptions(): Record<string, any> {
    return {
      scope: ['email'],
    };
  }
}
