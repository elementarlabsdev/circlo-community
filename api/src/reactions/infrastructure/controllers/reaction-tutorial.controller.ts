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
import { NotificationType } from '@/notifications/domain/model/notification.model';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';

@Controller('reaction/tutorial')
@UseGuards(AuthGuard)
export class ReactionTutorialController {
  constructor(
    private readonly reactionsCatalog: ReactionsCatalogService,
    private readonly prisma: PrismaService,
    private readonly notificationManagerService: NotificationsManagerService,
    @Inject(REACTION_LIST_REPOSITORY)
    private readonly reactionListRepo: ReactionListRepositoryInterface,
  ) {}

  @Post(':tutorialId/:reactionId')
  async add(
    @Req() request: Request,
    @Param('tutorialId') tutorialId: string,
    @Param('reactionId') reactionId: string,
  ) {
    const reaction = await this.reactionsCatalog.findOneByIdOrFail(reactionId);
    const tutorial = await this.prisma.tutorial.findFirstOrThrow({
      where: { id: tutorialId, status: { type: 'published' } },
      include: { author: true },
    });
    const exists = await this.reactionListRepo.exists(
      request.user.id,
      'tutorial',
      tutorialId,
      reaction.id,
    );

    if (!exists) {
      await this.reactionListRepo.add(
        request.user.id,
        'tutorial',
        tutorialId,
        reaction.id,
      );
      await this.prisma.tutorial.update({
        where: { id: tutorial.id },
        data: { reactionsCount: tutorial.reactionsCount + 1 },
      });
      await this.notificationManagerService.createOrUpdateNotification({
        userId: tutorial.authorId,
        type: NotificationType.NEW_REACTION,
        actor: {
          id: request.user.id,
          name: request.user.name,
          username: request.user.username,
          avatarUrl: request.user.avatarUrl,
        },
        entity: {
          id: reaction.id,
          type: 'reaction',
          name: reaction.type,
        },
        parentEntity: {
          id: tutorial.id,
          type: 'tutorial',
          name: tutorial.title,
        },
        additionalData: {
          reaction: {
            type: reaction.type,
            name: reaction.name,
            iconUrl: reaction.iconUrl,
          },
          tutorial: {
            id: tutorial.id,
            title: tutorial.title,
            slug: tutorial.slug!,
          },
        },
      });
    }

    return {};
  }

  @Delete(':tutorialId/:reactionId')
  async delete(
    @Req() request: Request,
    @Param('tutorialId') tutorialId: string,
    @Param('reactionId') reactionId: string,
  ) {
    const reaction = await this.reactionsCatalog.findOneByIdOrFail(reactionId);
    await this.reactionListRepo.delete(
      request.user.id,
      'tutorial',
      tutorialId,
      reaction.id,
    );
    const tutorial = await this.prisma.tutorial.findFirstOrThrow({
      where: { id: tutorialId, status: { type: 'published' } },
    });
    await this.prisma.tutorial.update({
      where: { id: tutorial.id },
      data: { reactionsCount: tutorial.reactionsCount - 1 },
    });
    return {};
  }
}
