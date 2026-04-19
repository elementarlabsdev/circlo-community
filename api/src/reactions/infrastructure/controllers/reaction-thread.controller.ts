import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ReactionsCatalogService } from '@/reactions/application/services/reactions-catalog.service';
import {
  REACTION_LIST_REPOSITORY,
  ReactionListRepositoryInterface,
} from '@/reactions/domain/repositories/reaction-list.repository';
import { ThreadsService } from '@/threads/application/services/threads.service';

@Controller('reaction/thread')
@UseGuards(AuthGuard)
export class ReactionThreadController {
  constructor(
    private readonly threadsService: ThreadsService,
    private readonly reactionsCatalog: ReactionsCatalogService,
    private readonly prisma: PrismaService,
    @Inject(REACTION_LIST_REPOSITORY)
    private readonly reactionListRepo: ReactionListRepositoryInterface,
  ) {}

  @Post(':threadId/:reactionId')
  async add(
    @Req() request: Request,
    @Param('threadId') threadId: string,
    @Param('reactionId') reactionId: string,
  ) {
    const reaction = await this.reactionsCatalog.findOneByIdOrFail(reactionId);
    const thread = await this.threadsService.getThread(threadId);
    const exists = await this.reactionListRepo.exists(
      request.user.id,
      'thread',
      threadId,
      reaction.id,
    );

    if (!exists) {
      await this.reactionListRepo.add(
        request.user.id,
        'thread',
        threadId,
        reaction.id,
      );
      await this.prisma.thread.update({
        where: { id: thread.id },
        data: { reactionsCount: (thread as any).reactionsCount + 1 },
      });
    }

    return {};
  }

  @Delete(':threadId/:reactionId')
  async delete(
    @Req() request: Request,
    @Param('threadId') threadId: string,
    @Param('reactionId') reactionId: string,
  ) {
    const reaction = await this.reactionsCatalog.findOneByIdOrFail(reactionId);
    await this.reactionListRepo.delete(
      request.user.id,
      'thread',
      threadId,
      reaction.id,
    );
    const thread = await this.threadsService.getThread(threadId);
    await this.prisma.thread.update({
      where: { id: thread.id },
      data: { reactionsCount: Math.max(0, (thread as any).reactionsCount - 1) },
    });
    return {};
  }
}
