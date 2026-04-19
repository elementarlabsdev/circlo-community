import { Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AUTH_TOKEN_NAME } from '@/common/domain/interfaces/types';

@Controller()
export class LogoutController {
  constructor(private _configService: ConfigService) {}

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie(this._configService.get(AUTH_TOKEN_NAME), {
      httpOnly: false,
      // domain: this._configService.get('FRONTEND_URL'),
    });
  }
}
