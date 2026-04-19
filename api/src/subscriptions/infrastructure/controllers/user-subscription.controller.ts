import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { FollowUserUseCase } from '@/subscriptions/application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from '@/subscriptions/application/use-cases/unfollow-user.use-case';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('user')
@UseGuards(AuthGuard)
export class UserSubscriptionController {
  constructor(
    private readonly followUserUseCase: FollowUserUseCase,
    private readonly unfollowUserUseCase: UnfollowUserUseCase,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Post(':id/subscription')
  async followUser(@Req() request: Request, @Param('id') userId: string) {
    await this.followUserUseCase.execute(request.user, userId);

    await this.recommendationQueue.add('update-user-interests', {
      userId: request.user.id,
      targetId: userId,
      targetType: 'user',
    });

    return {};
  }

  @Delete(':id/subscription')
  async unfollowUser(@Req() request: Request, @Param('id') userId: string) {
    await this.unfollowUserUseCase.execute(request.user, userId);

    await this.recommendationQueue.add('update-user-interests', {
      userId: request.user.id,
      targetId: userId,
      targetType: 'user',
    });

    return {};
  }
}
