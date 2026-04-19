import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from '@/identity/application/services/users.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';

@Injectable()
export class UnfollowUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async execute(actor: User, targetUserId: string): Promise<void> {
    const targetUser = await this.usersService.findOneById(targetUserId);

    const isExist = await this.subscriptionsService.exists(actor, targetUser);
    if (isExist) {
      await this.subscriptionsService.remove(actor, targetUser);
    }
  }
}
