import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { PoliciesGuard } from '@/identity/infrastructure/guards/policies.guard';
import { CheckPolicies } from '@/common/infrastructure/decorators/check-policies.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { TutorialResourceGuard } from '@/tutorials/infrastructure/guards/tutorial-resource.guard';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { TutorialSettingsDto } from '@/tutorials/application/dto/tutorial-settings.dto';
import { TutorialFeaturedImageDto } from '@/tutorials/application/dto/tutorial-featured-image.dto';
import { UpdateTutorialDto } from '@/tutorials/application/dto/update-tutorial.dto';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { PublishTutorialDto } from '@/tutorials/application/dto/publish-tutorial.dto';
import { TopicsService } from '@/topics/application/services/topics.service';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { LicenseTypeService } from '@/platform/application/services/license-type.service';
import { Tutorial } from '@/tutorials/domain/entities/tutorial.entity';
import { FeatureEnabledGuard } from '@/common/infrastructure/guards/feature-enabled.guard';
import { FeatureEnabled } from '@/common/infrastructure/decorators/feature-enabled.decorator';

@UseGuards(AuthGuard, FeatureEnabledGuard)
@FeatureEnabled('contentAllowTutorials')
@Controller('studio/tutorials')
export class StudioTutorialsController {
  constructor(
    private readonly tutorialsService: TutorialsService,
    private readonly dataTableService: DataTableService,
    private readonly topicsService: TopicsService,
    private readonly channelsService: ChannelsService,
    private readonly licenseTypeService: LicenseTypeService,
  ) {}

  // Details
  @Get(':id/details')
  @UseGuards(AuthGuard, TutorialResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(Action.Read, (ctx.switchToHttp().getRequest() as any).resource),
  )
  async tutorialDetails(@GetUser() user: User, @Param('id') id: string) {
    console.log('Fetching tutorial details for user:', user?.username);
    const tutorial = await this.tutorialsService.getTutorialDetails(id, user);
    return { tutorial };
  }

  // Tutorial details (available to owner or if published)
  @Get(':id')
  @UseGuards(AuthGuard, TutorialResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(Action.Read, (ctx.switchToHttp().getRequest() as any).resource),
  )
  async getTutorialDetails(
    @Param('id') id: string,
    @GetUser() user: User | undefined,
  ) {
    const tutorial = await this.tutorialsService.getTutorialDetails(id, user);
    return { tutorial };
  }

  // Explicit public-view endpoint (no user context)
  @Get(':id/public-view')
  getTutorialDetailsPublic(@Param('id') id: string) {
    return this.tutorialsService.getTutorialDetails(id, null);
  }

  // Draft
  @Post()
  @UseGuards(AuthGuard)
  async createTutorialDraft(@GetUser() user: User) {
    const tutorial = await this.tutorialsService.createTutorialDraft(user);
    return { tutorial };
  }

  // List (DataTable + Filters)
  @Post('list')
  @UseGuards(AuthGuard)
  async list(@GetUser() user: User, @Body() dto: DataTableQueryDto) {
    dto.filter_authorId = user.id;
    const tutorials = await this.dataTableService.query(dto);
    const topics = await this.topicsService.findUsedByTutorialInstructor(
      user.id,
    );
    const channels = await this.channelsService.findUsedByTutorialInstructor(
      user.id,
    );
    return {
      ...tutorials,
      topics,
      channels,
    };
  }

  // Overview
  @Get(':id/overview')
  @UseGuards(AuthGuard, TutorialResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(Action.Read, (ctx.switchToHttp().getRequest() as any).resource),
  )
  async tutorialOverview(@GetUser() user: User, @Param('id') id: string) {
    const tutorial = await this.tutorialsService.getTutorialOverview(id, user);
    return { tutorial };
  }

  // My view (details for owner)
  @Get(':id/my-view')
  getTutorialDetailsForUser(@Param('id') id: string, @GetUser() user: User) {
    return this.tutorialsService.getTutorialDetails(id, user);
  }

  // Settings - get
  @Get(':id/settings')
  @UseGuards(AuthGuard, TutorialResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async tutorialSettings(@GetUser() user: User, @Param('id') id: string) {
    const allTopics = await this.topicsService.findAll();
    const channels = await this.channelsService.findAll();
    const licenseTypes = await this.licenseTypeService.findAll();
    const { tutorial } = await this.tutorialsService.getTutorialSettings(
      id,
      user,
    );
    return {
      tutorial,
      allTopics,
      channels,
      licenseTypes,
    };
  }

  // Settings - update
  @Post(':id/settings')
  @UseGuards(AuthGuard, TutorialResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async tutorialSettingsUpdate(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: TutorialSettingsDto,
  ) {
    const res = await this.tutorialsService.tutorialSettingsUpdate(
      id,
      user,
      dto,
    );
    // May contain { draftTutorialId } when edits are redirected to a draft
    return res ?? {};
  }

  // Featured image - update
  @Post(':id/featured-image')
  @UseGuards(AuthGuard, TutorialResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async tutorialFeaturedImageUpdate(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: TutorialFeaturedImageDto,
  ) {
    const res = await this.tutorialsService.tutorialFeaturedImageUpdate(
      id,
      user,
      dto,
    );
    // May contain { draftTutorialId } when edits are redirected to a draft
    return res ?? {};
  }

  // Update tutorial
  @Patch(':id')
  @UseGuards(AuthGuard, TutorialResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async updateTutorial(
    @Param('id') id: string,
    @Body() updateTutorialDto: UpdateTutorialDto,
    @GetUser() user: User,
  ) {
    const tutorial = await this.tutorialsService.updateTutorial(
      id,
      updateTutorialDto,
      user,
    );
    return { tutorial };
  }

  // Lifecycle: archive
  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  async archiveTutorial(@Param('id') id: string, @GetUser() user: User) {
    const tutorial = await this.tutorialsService.archiveTutorial(id, user);
    return { tutorial };
  }

  // Lifecycle: publish
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publishTutorial(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() dto: PublishTutorialDto,
  ) {
    const tutorial = await this.tutorialsService.publishTutorial(id, user, dto);
    return { tutorial };
  }

  @Delete(':id/schedule')
  @HttpCode(HttpStatus.OK)
  async cancelSchedule(@Param('id') id: string, @GetUser() user: User) {
    const tutorial = await this.tutorialsService.cancelSchedule(id, user);
    return { tutorial };
  }

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, TutorialResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Update,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async unpublishTutorial(@Param('id') id: string, @GetUser() user: User) {
    const tutorial = await this.tutorialsService.unpublishTutorial(id, user);
    return { tutorial };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, TutorialResourceGuard, PoliciesGuard)
  @CheckPolicies((ability, ctx) =>
    ability.can(
      Action.Delete,
      (ctx.switchToHttp().getRequest() as any).resource,
    ),
  )
  async deleteTutorial(@Param('id') id: string, @GetUser() user: User) {
    const tutorial = await this.tutorialsService.deleteTutorial(id, user);
    return { tutorial };
  }
}
