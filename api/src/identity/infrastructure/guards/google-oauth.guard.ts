import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as passport from 'passport';
import { Strategy as GoogleStrategyLib } from 'passport-google-oauth20';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const row = await this.prisma.oAuthProvider.findUnique({
      where: { type: 'google' },
    });

    let clientID = this.configService.get<string>('GOOGLE_CLIENT_ID');
    let clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    let callbackURL = this.configService.get<string>('GOOGLE_CALLBACK_URL');

    if (row && row.isEnabled && row.isConfigured) {
      const cfg = (row as any).config ?? {};
      clientID = cfg.clientId || clientID;
      clientSecret = cfg.clientSecret || clientSecret;
      const hostUrl = this.configService.get<string>('BACKEND_HOST_URL');
      const defaultCallback = `${hostUrl}/api/v1/oauth/google/callback`;
      callbackURL =
        cfg.callbackURL || cfg.callbackUrl || callbackURL || defaultCallback;
    }

    if (!clientID || !clientSecret) {
      throw new Error('Google OAuth is not configured');
    }

    if (!callbackURL) {
      const hostUrl = this.configService.get<string>('BACKEND_HOST_URL');
      callbackURL = `${hostUrl}/api/v1/oauth/google/callback`;
    }

    const strategy = new GoogleStrategyLib(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      },
    );

    // Dynamic strategy registration
    (passport as any)._strategies['google'] = strategy;

    return super.canActivate(context) as Promise<boolean>;
  }

  // Ensure Google OAuth receives the required scope parameter
  getAuthenticateOptions(): Record<string, any> {
    return {
      scope: ['profile', 'email'],
    };
  }
}
