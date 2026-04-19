import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { ListSubscriptionsUseCase } from '@/subscriptions/application/use-cases/list-subscriptions.use-case';

@Injectable()
export class SubscriptionListService {
  constructor(
    private readonly listSubscriptionsUseCase: ListSubscriptionsUseCase,
  ) {}

  async pagination(user: User, pageNumber: number, pageSize = 20) {
    return this.listSubscriptionsUseCase.execute({
      user,
      pageNumber,
      pageSize,
    });
  }
}
