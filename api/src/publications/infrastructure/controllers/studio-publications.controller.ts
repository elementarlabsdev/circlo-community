import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { PoliciesGuard } from '@/identity/infrastructure/guards/policies.guard';
import { CheckPolicies } from '@/common/infrastructure/decorators/check-policies.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PublicationResourceGuard } from '@/publications/infrastructure/guards/publication-resource.guard';
import { LicenseTypeService } from '@/platform/application/services/license-type.service';
import { TopicsService } from '@/topics/application/services/topics.service';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FEATURED_IMAGE_UPLOAD_PIPE_BUILDER } from '@/common/infrastructure/validators/featured-image-upload.pipe-builder';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { PublicationsService } from '@/publications/application/services/publications.service';
import { StudioPublicationListService } from '@/publications/application/services/studio-publication-list.service';
import { StudioPublicationsDataTableService } from '@/publications/application/services/studio-publications-data-table.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { ActivityService } from '@/platform/application/services/activity.service';
import { PublicationContentDto } from '@/publications/application/dtos/publication-content.dto';
import { PublicationSettingsDto } from '@/publications/application/dtos/publication-settings.dto';
import { Publication } from '@/publications/domain/entities/publication.entity';

import { FeatureEnabledGuard } from '@/common/infrastructure/guards/feature-enabled.guard';
import { FeatureEnabled } from '@/common/infrastructure/decorators/feature-enabled.decorator';

@UseGuards(AuthGuard, FeatureEnabledGuard)
@FeatureEnabled('contentAllowPublications')
@Controller()
export class StudioPublicationsController {
  constructor(
    private readonly publicationsService: PublicationsService,
    private readonly topicsService: TopicsService,
    private readonly channelsService: ChannelsService,
    private readonly licenseTypeService: LicenseTypeService,
    private readonly activityService: ActivityService,
    private readonly publicationListService: StudioPublicationListService,
    private readonly dataTable: StudioPublicationsDataTableService,
  ) {}

  @Post('studio/publication/new')
  @UseGuards(AuthGuard)
  async new(@GetUser() user: any) {
    const { hash, id, title } =
      await this.publicationsService.createDraft(user);
    await this.activityService.createActivity({
      actor: user,
      action: 'POST_CREATED',
      targetType: 'POST',
      targetId: id,
      details: { title, hash },
    });
    return { publication: { hash } };
  }

  @Get('studio/publication/edit/:hash')
  @UseGuards(AuthGuard, PublicationResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async edit(
    @GetUser() user: any,
    @Req() req: any,
    @Param('hash') hash: string,
  ) {
    const publication = await this.publicationsService.findDraftByHash(hash);
    const allTopics = await this.topicsService.findAll();
    const channels = await this.channelsService.findAll();
    const licenseTypes = await this.licenseTypeService.findAll();
    return {
      publication,
      allTopics,
      channels,
      licenseTypes,
    };
  }

  @Post('studio/publication/edit/:hash/content')
  @UseGuards(AuthGuard, PublicationResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async saveContent(
    @GetUser() user: any,
    @Param('hash') hash: string,
    @Body() publicationDto: PublicationContentDto,
  ) {
    const publication = await this.publicationsService.saveContent(
      hash,
      publicationDto,
    );
    return { publication };
  }

  @Post('studio/publication/edit/:hash/settings')
  @UseGuards(AuthGuard, PublicationResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async saveSettings(
    @GetUser() user: any,
    @Param('hash') hash: string,
    @Body() publicationDto: PublicationSettingsDto,
  ) {
    const publication = await this.publicationsService.saveSettings(
      hash,
      publicationDto,
      user,
    );
    return { publication };
  }

  @Post('studio/publication/edit/:hash/featured-image')
  @UseGuards(AuthGuard, PublicationResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  @UseInterceptors(FileInterceptor('image'))
  async addFeaturedImage(
    @GetUser() user: any,
    @Req() req: Request,
    @Param('hash') hash: string,
    @UploadedFile(FEATURED_IMAGE_UPLOAD_PIPE_BUILDER)
    image: Express.Multer.File,
  ) {
    const publication = await this.publicationsService.findDraftByHash(hash);
    return {
      publication: await this.publicationsService.addFeaturedImage(
        publication,
        image,
        user,
      ),
    };
  }

  @Post('studio/publication/edit/:hash/upload/image')
  @UseGuards(AuthGuard, PublicationResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  @UseInterceptors(FileInterceptor('image'))
  async addImage(
    @GetUser() user: any,
    @Param('hash') hash: string,
    @UploadedFile(FEATURED_IMAGE_UPLOAD_PIPE_BUILDER)
    image: Express.Multer.File,
  ) {
    const draft = await this.publicationsService.findDraftByHash(hash);
    const { file, publication } = await this.publicationsService.addImage(
      draft,
      image,
      user,
    );
    return {
      success: true,
      file: { url: file.url },
      publication,
    };
  }

  @Post('studio/publication/:hash/publish')
  async publish(
    @GetUser() user: any,
    @Req() request: Request,
    @Param('hash') hash: string,
    @Body('scheduledAt') scheduledAt?: string,
  ) {
    const draft = await this.publicationsService.findDraftByHash(hash);
    let publication;
    if (scheduledAt) {
      publication = await this.publicationsService.schedulePublish(
        draft,
        new Date(scheduledAt),
      );
    } else {
      publication = await this.publicationsService.publish(draft);
    }
    await this.activityService.createActivity({
      actor: user,
      action: scheduledAt ? 'POST_SCHEDULED' : 'POST_PUBLISHED',
      targetType: 'POST',
      targetId: publication.id,
      details: { title: publication.title, hash },
    });
    return { publication };
  }

  @Post('studio/publication/:hash/cancel-schedule')
  async cancelSchedule(@GetUser() user: any, @Param('hash') hash: string) {
    const draft = await this.publicationsService.findDraftByHash(hash);
    const publication = await this.publicationsService.cancelSchedule(draft);
    await this.activityService.createActivity({
      actor: user,
      action: 'POST_SCHEDULE_CANCELLED',
      targetType: 'POST',
      targetId: publication.id,
      details: { title: publication.title, hash },
    });
    return { publication };
  }

  @Post('studio/publications/list')
  async list(@GetUser() user: any, @Body() dto: DataTableQueryDto) {
    dto.filter_authorId = user.id;
    const data = await this.dataTable.query(dto, user);
    const topics = await this.topicsService.findUsedByUser(user.id);
    const channels = await this.channelsService.findUsedByUser(user.id);
    return {
      ...data,
      topics,
      channels,
    };
  }

  @Delete('studio/publications/:hash')
  @UseGuards(AuthGuard, PublicationResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Delete,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async delete(@GetUser() user: any, @Param('hash') hash: string) {
    const draft = await this.publicationsService.findDraftByHash(hash);
    await this.publicationListService.forceDelete(hash, user);
    await this.activityService.createActivity({
      actor: user,
      action: 'POST_DELETED_PERMANENTLY',
      targetType: 'POST',
      targetId: draft.id,
      details: { title: draft.title },
    });
    return {};
  }

  @Post('studio/publications/:hash/unpublish')
  @UseGuards(AuthGuard, PublicationResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async unpublish(@GetUser() user: any, @Param('hash') hash: string) {
    const draft = await this.publicationsService.findDraftByHash(hash);
    await this.publicationListService.unpublish(hash, user);
    await this.activityService.createActivity({
      actor: user,
      action: 'POST_UNPUBLISHED',
      targetType: 'POST',
      targetId: draft.id,
      details: { title: draft.title },
    });
    return {};
  }

  @Post('studio/publication/edit/:hash/featured-image/delete')
  @UseGuards(AuthGuard, PublicationResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async deleteFeaturedImage(
    @GetUser() user: any,
    @Param('hash') hash: string,
  ) {
    const publication = await this.publicationsService.findDraftByHash(hash);
    return {
      publication: await this.publicationsService.deleteFeaturedImage(publication),
    };
  }
}
