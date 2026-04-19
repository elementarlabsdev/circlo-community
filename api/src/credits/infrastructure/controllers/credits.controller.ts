import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CreditsService } from '@/credits/application/services/credits.service';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('credits')
@UseGuards(AuthGuard)
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('my')
  async getMyTransactions(@GetUser() user: User) {
    return await this.creditsService.getUserTransactions(user.id);
  }
}

@Controller('admin/credits')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminCreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get('transactions')
  @CheckAbilities([Action.Read, 'Credits'])
  async getAllTransactions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return await this.creditsService.getAllTransactions(Number(page), Number(limit));
  }

  @Post('adjust')
  @CheckAbilities([Action.Manage, 'Credits'])
  async adjustCredits(@Body() body: { userId: string; amount: number; reason: string }) {
    return await this.creditsService.manualAdjust(body.userId, body.amount, body.reason);
  }
}
