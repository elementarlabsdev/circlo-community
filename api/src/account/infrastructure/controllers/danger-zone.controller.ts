import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { Request } from '@/common/domain/interfaces/interfaces';
import { ConfigService } from '@nestjs/config';
import { DeactivateUserUseCase } from '@/identity/application/use-cases/deactivate-user.use-case';
import { DeleteCurrentUserUseCase } from '@/identity/application/use-cases/delete-current-user.use-case';
import { AUTH_TOKEN_NAME } from '@/common/domain/interfaces/types';

@Controller('studio/account/danger-zone')
@UseGuards(AuthGuard)
export class DangerZoneController {
  constructor(
    private readonly deactivateUser: DeactivateUserUseCase,
    private readonly deleteCurrentUser: DeleteCurrentUserUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Post('deactivate')
  async deactivate(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Mark user as deactivated via application use case
    await this.deactivateUser.execute(request.user.id);

    // Clear auth cookie to log the user out immediately
    res.clearCookie(this.configService.get(AUTH_TOKEN_NAME), {
      httpOnly: false,
    });

    return { ok: true };
  }

  @Post('delete')
  async deleteAccount(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Delegate deletion to application use case to follow DDD and clean architecture principles
    const result = await this.deleteCurrentUser.execute(request.user.id);
    if (!result.ok) {
      // Return application-level error code as-is for the client to handle
      return result;
    }

    // Clear auth cookie to log the user out immediately
    res.clearCookie(this.configService.get(AUTH_TOKEN_NAME), {
      httpOnly: false,
    });

    return { ok: true };
  }
}
