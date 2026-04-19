import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { Request } from '@/common/domain/interfaces/interfaces';
import { GetCookieSettingsUseCase } from '@/account/application/use-cases/get-cookie-settings.use-case';
import { SaveCookieSettingsUseCase } from '@/account/application/use-cases/save-cookie-settings.use-case';
import { CookieSettingsDto } from '@/account/application/dtos/cookie-settings.dto';

@Controller('studio/account/cookie')
@UseGuards(AuthGuard)
export class CookieController {
  constructor(
    private readonly getCookieSettings: GetCookieSettingsUseCase,
    private readonly saveCookieSettings: SaveCookieSettingsUseCase,
  ) {}

  @Get()
  async index(@Req() request: Request) {
    const cookieSettings = await this.getCookieSettings.execute(
      request.user.id,
    );
    return {
      cookieSettings,
    };
  }

  @Post()
  async save(
    @Req() request: Request,
    @Body() cookieSettings: CookieSettingsDto,
  ) {
    await this.saveCookieSettings.execute(request.user.id, cookieSettings);
    return {};
  }
}
