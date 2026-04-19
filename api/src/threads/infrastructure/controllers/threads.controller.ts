import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ThreadsService } from '@/threads/application/services/threads.service';
import { CreateThreadDto } from '@/threads/application/dtos/create-thread.dto';
import { Request } from '@/common/domain/interfaces/interfaces';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { SettingsService } from '@/settings/application/services/settings.service';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { TargetReactionsService } from '@/reactions/application/services/target-reactions.service';
import { DefaultGateway } from '@/platform/infrastructure/default.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FeatureEnabledGuard } from '@/common/infrastructure/guards/feature-enabled.guard';
import { FeatureEnabled } from '@/common/infrastructure/decorators/feature-enabled.decorator';

@Controller('threads')
@UseGuards(FeatureEnabledGuard)
@FeatureEnabled('contentAllowThreads')
export class ThreadsController {
  constructor(
    private readonly threadsService: ThreadsService,
    private readonly settings: SettingsService,
    private readonly targetReactionsService: TargetReactionsService,
    private readonly websocketGateway: DefaultGateway,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Req() request: Request,
    @Body() createThreadDto: CreateThreadDto,
  ) {
    if (createThreadDto.parentId) {
      const reply = await this.threadsService.reply(
        request.user.id,
        createThreadDto.parentId,
        createThreadDto.content,
      );

      const primitives = reply.toPrimitives();
      const reactions = await this.targetReactionsService.getReactions(
        reply.id,
        'thread',
        request.user,
      );

      this.websocketGateway.sendAddThreadReply({
        ...primitives,
        reactions,
      });

      return primitives;
    }

    const thread = await this.threadsService.createRoot(
      request.user.id,
      createThreadDto.content,
      createThreadDto.mediaItemIds,
    );
    return thread.toPrimitives();
  }

  @Get(':id/discussion')
  async getDiscussion(@Param('id') id: string, @GetUser() user: User | undefined) {
    if (user) {
      await this.recommendationQueue.add('update-user-interests', {
        userId: user.id,
        targetId: id,
        targetType: 'thread',
      });
    }
    const comment = await this.buildDiscussionTree(id, user, 0, 1);
    return {
      comment,
    };
  }

  private async buildDiscussionTree(
    threadId: string,
    user: User | undefined,
    currentDepth: number,
    maxDepth: number,
  ): Promise<any> {
    const thread = await this.threadsService.getThread(threadId);
    const primitives = thread.toPrimitives();
    const reactions = await this.targetReactionsService.getReactions(threadId, 'thread', user);

    let replies = [];
    let nestedRepliesCount = 0;

    if (currentDepth < maxDepth) {
      const children = await this.threadsService.listChildren(threadId);
      replies = await Promise.all(
        children.map((c) => this.buildDiscussionTree(c.id, user, currentDepth + 1, maxDepth)),
      );
      // Calculate total number of nested (descendant) replies based on what was loaded
      nestedRepliesCount = replies.reduce(
        (sum, r: any) => sum + 1 + (r.nestedRepliesCount ?? 0),
        0,
      );
    }

    return {
      ...primitives,
      replies,
      reactions,
      nestedRepliesCount,
    };
  }

  @Post(':id/delete')
  @UseGuards(AuthGuard)
  async delete(@Req() request: Request, @Param('id') id: string) {
    const thread = await this.threadsService.getThread(id);
    if (thread.authorId !== request.user.id) {
      throw new ForbiddenException('You can only delete your own threads');
    }
    return this.threadsService.deleteThread(id);
  }
}
