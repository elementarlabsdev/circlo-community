import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { LoginDto } from '../../application/dtos/login.dto';
import { SyncCookiesDto } from '../../application/dtos/sync-cookies.dto';
import { IdentityService } from '@/identity/application/services/identity.service';
import { getClientIp } from 'request-ip';
import { AuthGuard } from '../guards/auth.guard';
import { Request as CustomRequest } from '@/common/domain/interfaces/interfaces';
import { CaptchaValidationService } from '../../application/services/captcha-validation.service';

@Controller('identity')
export class IdentityController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly captchaValidation: CaptchaValidationService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const ip =
      getClientIp(req) ||
      req.ip ||
      (req.connection as any)?.remoteAddress ||
      '';
    const remoteIp = Array.isArray(ip) ? ip[0] : ip;

    const user = await this.identityService.register(createUserDto, remoteIp);
    const isFirstUser = await this.identityService.isFirstUser();

    // the first user is always admin and verified
    if (!isFirstUser) {
      const hash = await this.identityService.sendEmailVerificationCode({
        user,
      });
      return { hash };
    }

    return {};
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'] || null;
    const ip =
      getClientIp(req) ||
      req.ip ||
      (req.connection as any)?.remoteAddress ||
      '';
    const context = {
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      userAgent: typeof userAgent === 'string' ? userAgent : null,
      device: 'web',
      location: null,
    };

    await this.captchaValidation.validate(loginDto, context.ipAddress);

    return this.identityService.login(loginDto, context);
  }

  @Post('sync-cookies')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async syncCookies(@Body() dto: SyncCookiesDto, @Req() req: CustomRequest) {
    return this.identityService.syncCookies(req.user.id, dto);
  }
}
