import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { CommentDto } from '@/comments/application/dto/comment.dto';
import { PublicationCommentsService } from '@/comments/application/services/publication-comments.service';
import { PublicationsService } from '@/publications/application/services/publications.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';
import { NotificationType } from '@/notifications/domain/model/notification.model';
import { DefaultGateway } from '@/platform/infrastructure/default.gateway';

@Controller('publication')
export class PublicationCommentsController {
  constructor(
    private _publicationsService: PublicationsService,
    private _publicationCommentsService: PublicationCommentsService,
    private _settingsService: SettingsService,
    private notificationManagerService: NotificationsManagerService,
    private websocketGateway: DefaultGateway,
  ) {}

  @Get(':publicationId/comments')
  async index(
    @Req() request: Request,
    @Param('publicationId') publicationId: string,
  ) {
    return {
      comments: await this._publicationCommentsService.findAllByPublicationId(
        publicationId,
        request.user,
      ),
      threadCommentsDepth: await this._settingsService.findValueByName(
        'threadCommentsDepth',
      ),
    };
  }

  @Post(':publicationId/comments')
  @UseGuards(AuthGuard)
  async add(
    @Req() request: Request,
    @Param('publicationId') publicationId: string,
    @Body() commentDto: CommentDto,
  ) {
    const publication: any = await this._publicationsService.findByIdOrFail(
      publicationId,
      {
        include: {
          author: true,
        },
      },
    );
    const comment = await this._publicationCommentsService.add(
      commentDto,
      publication,
      request.user,
    );

    await this.notificationManagerService.createOrUpdateNotification({
      userId: publication.author.id,
      type: NotificationType.NEW_COMMENT,
      actor: {
        id: request.user.id,
        name: request.user.name,
        username: request.user.username,
        avatarUrl: request.user.avatarUrl,
      },
      entity: {
        id: publication.id,
        type: 'publication',
        name: publication.title,
      },
      additionalData: {
        comment: {
          id: comment.id,
          htmlContent: comment.htmlContent,
        },
        publication: {
          id: publication.id,
          title: publication.title,
          slug: publication.slug,
        },
      },
    });
    this.websocketGateway.sendAddCommentToPublication(
      (request as any).user.id,
      publication.id,
      comment,
    );
    return {
      comment,
    };
  }

  @Post('comment/:commentId/reply')
  @UseGuards(AuthGuard)
  async reply(
    @Req() request: Request,
    @Param('commentId') commentId: string,
    @Body() commentDto: CommentDto,
  ) {
    const respondTo =
      await this._publicationCommentsService.findByIdOrFail(commentId);
    const childComment = await this._publicationCommentsService.reply(
      commentDto,
      respondTo,
      (request as any).user,
    );

    await this.notificationManagerService.createOrUpdateNotification({
      userId: (respondTo as any).author.id,
      type: NotificationType.REPLY_COMMENT,
      actor: {
        id: (request as any).user.id,
        name: (request as any).user.name,
        username: (request as any).user.username,
        avatarUrl: (request as any).user.avatarUrl,
      },
      entity: {
        id: (respondTo as any).id,
        type: 'comment',
      },
      additionalData: {
        respondTo: {
          id: (respondTo as any).id,
          htmlContent: (respondTo as any).htmlContent,
        },
        comment: {
          id: (childComment as any).id,
          htmlContent: (childComment as any).htmlContent,
        },
        publication: {
          id: (respondTo as any).publication.id,
          title: (respondTo as any).publication.title,
          slug: (respondTo as any).publication.slug,
        },
      },
    });
    this.websocketGateway.sendAddReplyToCommentInPublication(
      (request as any).user.id,
      (respondTo as any).publication.id,
      (respondTo as any).id,
      childComment,
    );

    return {
      comment: childComment,
    };
  }

  @Delete(':publicationId/comments/:commentId')
  @UseGuards(AuthGuard)
  async delete() {
    return {};
  }
}
