import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as passport from 'passport';
import { Strategy as GithubStrategyLib } from 'passport-github2';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class GithubOauthGuard extends AuthGuard('github') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const row = await this.prisma.oAuthProvider.findUnique({
      where: { type: 'github' },
    });

    let clientID = this.configService.get<string>('GITHUB_CLIENT_ID');
    let clientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET');
    let callbackURL = this.configService.get<string>('GITHUB_CALLBACK_URL');
    let scope: string[] = ['user:email'];
    const siteTitle =
      (await this.settingsService.findValueByName('siteTitle')) || 'Circlo';

    if (row && row.isEnabled && row.isConfigured) {
      const cfg = (row as any).config ?? {};
      clientID = cfg.clientId || clientID;
      clientSecret = cfg.clientSecret || clientSecret;
      const hostUrl = this.configService.get<string>('BACKEND_HOST_URL');
      const defaultCallback = `${hostUrl}/api/v1/oauth/github/callback`;
      callbackURL =
        cfg.callbackURL || cfg.callbackUrl || callbackURL || defaultCallback;
      scope =
        Array.isArray(cfg.scope) && cfg.scope.length > 0 ? cfg.scope : scope;
    }

    if (!clientID || !clientSecret) {
      throw new Error('GitHub OAuth is not configured');
    }

    if (!callbackURL) {
      const hostUrl = this.configService.get<string>('BACKEND_HOST_URL');
      callbackURL = `${hostUrl}/api/v1/oauth/github/callback`;
    }

    const strategy = new GithubStrategyLib(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope,
        userAgent: siteTitle,
      },
      async (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      },
    );

    // Dynamic strategy registration
    (passport as any)._strategies['github'] = strategy;

    return super.canActivate(context) as Promise<boolean>;
  }

  getAuthenticateOptions(): Record<string, any> {
    return {
      scope: ['user:email'],
    };
  }
}
