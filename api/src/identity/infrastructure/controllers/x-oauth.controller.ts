import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { UsersService } from '@/identity/application/services/users.service';
import { AuthService } from '@/identity/application/services/auth.service';
import { XOauthGuard } from '@/identity/infrastructure/guards/x-oauth.guard';
import { AUTH_TOKEN_NAME } from '@/common/domain/interfaces/types';
import { generateFallbackEmail } from '@/common/infrastructure/utils/email';

@Controller('oauth/x')
@UseGuards(XOauthGuard)
export class XOauthController {
  constructor(
    private _configService: ConfigService,
    private readonly authService: AuthService,
    private readonly _usersService: UsersService,
    private readonly _prisma: PrismaService,
  ) {}

  @Get()
  async index() {}

  @Get('callback')
  async callback(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    // Find verified primary email first, then any verified, then first email
    let email = null;
    if (req.user?.emails?.length > 0) {
      const primaryEmail = req.user.emails.find((e: any) => e.primary && e.verified);
      const anyVerified = req.user.emails.find((e: any) => e.verified);
      email = (primaryEmail || anyVerified || req.user.emails[0]).value;
    }

    if (!email) {
      email = generateFallbackEmail(
        req.user.id,
        this._configService.get('DOMAIN'),
      );
    }
    const avatarUrl =
      req.user?.photos?.length > 0 ? req.user.photos[0].value : '';
    let user = await this._usersService.findOneByEmail(email);

    if (!user) {
      const createdUser = await this._usersService.create(
        {
          name: req.user.displayName,
          email,
          password: (globalThis as any).crypto.randomUUID(),
          preferredColorScheme: 'light',
          username: req.user.username,
        },
        'x',
        false,
      );
      user = await this._usersService.findOneById(createdUser.id);
      await this._prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          avatarUrl,
        },
      });
    } else {
      await this._prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          lastActivityAt: new Date(),
        },
      });
    }

    const oauthProvider = await this._prisma.userOAuthLoginProvider.findFirst({
      where: {
        type: 'x',
        userId: user.id,
      },
    });

    const profileUrl = req.user.profileUrl || '';
    const username = req.user.username || req.user.displayName || email || '';

    if (!oauthProvider) {
      await this._prisma.userOAuthLoginProvider.create({
        data: {
          type: 'x',
          profileId: req.user.id,
          profileUrl,
          username,
          data: req.user._json,
          userId: user.id,
        },
      });
    } else {
      await this._prisma.userOAuthLoginProvider.update({
        where: {
          id: oauthProvider.id,
        },
        data: {
          profileUrl: oauthProvider.profileUrl || profileUrl,
          username: oauthProvider.username || username,
          data: req.user._json,
        },
      });
    }

    const result = await this.authService.loginByOAuth(user as any);

    if (result.user.isBlocked) {
      return res.redirect(this._configService.get('FRONTEND_URL'));
    }

    res.cookie(AUTH_TOKEN_NAME, result.authToken, {
      httpOnly: false,
      domain: this._configService.get('DOMAIN'),
    });
    return res.redirect(this._configService.get('FRONTEND_URL'));
  }
}
