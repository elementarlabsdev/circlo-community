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
import { FollowChannelUseCase } from '@/subscriptions/application/use-cases/follow-channel.use-case';
import { UnfollowChannelUseCase } from '@/subscriptions/application/use-cases/unfollow-channel.use-case';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('channel')
@UseGuards(AuthGuard)
export class ChannelSubscriptionController {
  constructor(
    private readonly followChannelUseCase: FollowChannelUseCase,
    private readonly unfollowChannelUseCase: UnfollowChannelUseCase,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Post(':id/subscription')
  async followChannel(@Req() request: Request, @Param('id') channelId: string) {
    await this.followChannelUseCase.execute(request.user, channelId);

    await this.recommendationQueue.add('update-user-interests', {
      userId: request.user.id,
      targetId: channelId,
      targetType: 'channel',
    });

    return {};
  }

  @Delete(':id/subscription')
  async unfollowChannel(
    @Req() request: Request,
    @Param('id') channelId: string,
  ) {
    await this.unfollowChannelUseCase.execute(request.user, channelId);

    await this.recommendationQueue.add('update-user-interests', {
      userId: request.user.id,
      targetId: channelId,
      targetType: 'channel',
    });

    return {};
  }
}
