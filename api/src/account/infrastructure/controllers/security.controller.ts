import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { Request } from '@/common/domain/interfaces/interfaces';
import { RequestEmailChangeUseCase } from '@/account/application/use-cases/request-email-change.use-case';
import { ConfirmEmailChangeUseCase } from '@/account/application/use-cases/confirm-email-change.use-case';
import { GetSecuritySettingsUseCase } from '@/account/application/use-cases/get-security-settings.use-case';
import { ChangePasswordUseCase } from '@/account/application/use-cases/change-password.use-case';
import { DeleteOAuthProviderUseCase } from '@/account/application/use-cases/delete-oauth-provider.use-case';
import { ChangeEmailConfirmDto } from '@/account/application/dtos/change-email-confirm.dto';
import { ChangeEmailRequestDto } from '@/account/application/dtos/change-email-request.dto';
import { ChangePasswordDto } from '@/account/application/dtos/change-password.dto';

@Controller('studio/account/security')
@UseGuards(AuthGuard)
export class SecurityController {
  constructor(
    private readonly requestEmailChangeUseCase: RequestEmailChangeUseCase,
    private readonly confirmEmailChangeUseCase: ConfirmEmailChangeUseCase,
    private readonly getSecuritySettings: GetSecuritySettingsUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly deleteOAuthProviderUseCase: DeleteOAuthProviderUseCase,
  ) {}

  @Get()
  async index(@Req() request: Request) {
    return this.getSecuritySettings.execute(
      request.user.id,
      request.user.email,
    );
  }

  @Post('change-password')
  async changePassword(
    @Req() request: Request,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.changePasswordUseCase.execute({
      userId: request.user.id,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
    return {};
  }

  @Post('change-email/request')
  async changeEmailRequest(
    @Req() request: Request,
    @Body() dto: ChangeEmailRequestDto,
  ) {
    return this.requestEmailChangeUseCase.execute(
      request.user.id,
      request.user.email,
      dto.newEmail,
    );
  }

  @Post('change-email/confirm')
  async changeEmailConfirm(
    @Req() request: Request,
    @Body() dto: ChangeEmailConfirmDto,
  ) {
    return this.confirmEmailChangeUseCase.execute(request.user.id, dto.code);
  }

  @Delete('oauth-providers/:id')
  async deleteOAuthProvider(@Req() request: Request, @Param('id') id: string) {
    return this.deleteOAuthProviderUseCase.execute(request.user.id, id);
  }
}
