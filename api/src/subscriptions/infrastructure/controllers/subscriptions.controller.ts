import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { ListSubscriptionsUseCase } from '@/subscriptions/application/use-cases/list-subscriptions.use-case';

@Controller('subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly listSubscriptionsUseCase: ListSubscriptionsUseCase,
  ) {}

  @Get()
  async index(
    @Req() request: Request,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
  ) {
    return this.listSubscriptionsUseCase.execute({
      user: request.user,
      pageNumber,
      pageSize: 20,
    });
  }
}
