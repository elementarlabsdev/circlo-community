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
import { PublicationsService } from '@/publications/application/services/publications.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ReactionsCatalogService } from '@/reactions/application/services/reactions-catalog.service';
import {
  REACTION_LIST_REPOSITORY,
  ReactionListRepositoryInterface,
} from '@/reactions/domain/repositories/reaction-list.repository';
import { NotificationType } from '@/notifications/domain/model/notification.model';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';

@Controller('reaction/publication')
@UseGuards(AuthGuard)
export class ReactionPublicationController {
  constructor(
    private readonly publicationsService: PublicationsService,
    private readonly reactionsCatalog: ReactionsCatalogService,
    private readonly prisma: PrismaService,
    private readonly notificationManagerService: NotificationsManagerService,
    @Inject(REACTION_LIST_REPOSITORY)
    private readonly reactionListRepo: ReactionListRepositoryInterface,
  ) {}

  @Post(':publicationId/:reactionId')
  async add(
    @Req() request: Request,
    @Param('publicationId') publicationId: string,
    @Param('reactionId') reactionId: string,
  ) {
    const reaction = await this.reactionsCatalog.findOneByIdOrFail(reactionId);
    const publication =
      await this.publicationsService.findByIdOrFail(publicationId);
    const exists = await this.reactionListRepo.exists(
      request.user.id,
      'publication',
      publicationId,
      reaction.id,
    );

    if (!exists) {
      await this.reactionListRepo.add(
        request.user.id,
        'publication',
        publicationId,
        reaction.id,
      );
      await this.prisma.publication.update({
        where: { id: publication.id },
        data: { reactionsCount: publication.reactionsCount + 1 },
      });
      await this.notificationManagerService.createOrUpdateNotification({
        userId: publication.authorId,
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
          id: publication.id,
          type: 'publication',
          name: publication.title,
        },
        additionalData: {
          reaction: {
            type: reaction.type,
            name: reaction.name,
            iconUrl: reaction.iconUrl,
          },
          publication: {
            id: publication.id,
            title: publication.title,
            slug: publication.slug,
          },
        },
      });
    }

    return {};
  }

  @Delete(':publicationId/:reactionId')
  async delete(
    @Req() request: Request,
    @Param('publicationId') publicationId: string,
    @Param('reactionId') reactionId: string,
  ) {
    const reaction = await this.reactionsCatalog.findOneByIdOrFail(reactionId);
    await this.reactionListRepo.delete(
      request.user.id,
      'publication',
      publicationId,
      reaction.id,
    );
    const publication =
      await this.publicationsService.findByIdOrFail(publicationId);
    await this.prisma.publication.update({
      where: { id: publication.id },
      data: { reactionsCount: publication.reactionsCount - 1 },
    });
    return {};
  }
}
