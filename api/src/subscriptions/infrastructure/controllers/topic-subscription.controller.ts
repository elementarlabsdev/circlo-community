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
import { FollowTopicUseCase } from '@/subscriptions/application/use-cases/follow-topic.use-case';
import { UnfollowTopicUseCase } from '@/subscriptions/application/use-cases/unfollow-topic.use-case';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('topic')
@UseGuards(AuthGuard)
export class TopicSubscriptionController {
  constructor(
    private readonly followTopicUseCase: FollowTopicUseCase,
    private readonly unfollowTopicUseCase: UnfollowTopicUseCase,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Post(':id/subscription')
  async followTopic(@Req() request: Request, @Param('id') topicId: string) {
    await this.followTopicUseCase.execute(request.user, topicId);

    await this.recommendationQueue.add('update-user-interests', {
      userId: request.user.id,
      targetId: topicId,
      targetType: 'topic',
    });

    return {};
  }

  @Delete(':id/subscription')
  async unfollowTopic(@Req() request: Request, @Param('id') topicId: string) {
    await this.unfollowTopicUseCase.execute(request.user, topicId);

    await this.recommendationQueue.add('update-user-interests', {
      userId: request.user.id,
      targetId: topicId,
      targetType: 'topic',
    });

    return {};
  }
}
