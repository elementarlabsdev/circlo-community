import { Controller, Get, NotFoundException, Param, Post, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';
import { TargetReactionsService } from '@/reactions/application/services/target-reactions.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { BookmarksService } from '@/bookmarks/application/services/bookmarks.service';
import { LicenseTypeService } from '@/platform/application/services/license-type.service';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FeatureEnabledGuard } from '@/common/infrastructure/guards/feature-enabled.guard';
import { FeatureEnabled } from '@/common/infrastructure/decorators/feature-enabled.decorator';

@Controller('tutorials')
@UseGuards(FeatureEnabledGuard)
@FeatureEnabled('contentAllowTutorials')
export class TutorialsController {
  constructor(
    private readonly tutorialsService: TutorialsService,
    private readonly targetReactionsService: TargetReactionsService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly bookmarksService: BookmarksService,
    private readonly licenseTypeService: LicenseTypeService,
    private readonly prisma: PrismaService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Get('slug/:slug')
  async getBySlug(@GetUser() user: any, @Param('slug') slug: string) {
    const tutorial = await this.tutorialsService.getPublishedBySlug(slug);

    if (!tutorial) {
      throw new NotFoundException('Tutorial not found');
    }

    if (user) {
      await this.recommendationQueue.add('update-user-interests', {
        userId: user.id,
        targetId: tutorial.id,
        targetType: 'tutorial',
      });
    }

    const reactions = await this.targetReactionsService.getReactions(
      tutorial.id,
      'tutorial',
      user,
    );

    let channelSubscription = null;
    if (tutorial.channel) {
      channelSubscription = await this.subscriptionsService.get(
        user,
        tutorial.channel,
      );
    }

    const authorSubscription = await this.subscriptionsService.get(
      user,
      tutorial.author,
    );

    const bookmark = await this.bookmarksService.get(
      user,
      tutorial.id,
      'tutorial',
    );

    await this.tutorialsService.increaseViews(tutorial);

    const licenseTypes = await this.licenseTypeService.findAll();
    const firstItem =
      await this.tutorialsService.getFirstPublishedItemByTutorialSlug(slug);

    const isPurchased = false; // Always free now

    return {
      tutorial,
      reactions,
      channelSubscription,
      authorSubscription,
      bookmark,
      licenseTypes,
      firstItem,
      isPurchased,
    };
  }

  @Get(':tutorialSlug/lessons/:lessonSlug')
  async getLessonBySlugs(
    @GetUser() user: any,
    @Param('tutorialSlug') tutorialSlug: string,
    @Param('lessonSlug') lessonSlug: string,
  ) {
    const data = await this.tutorialsService.getPublishedLessonBySlugs(
      tutorialSlug,
      lessonSlug,
    );
    if (!data) throw new NotFoundException('Lesson not found');

    await this.tutorialsService.increaseLessonViews(data.lesson);
    return data; // { tutorial, lesson }
  }

  @Get(':tutorialSlug/quizzes/:quizSlug')
  async getQuizBySlugs(
    @GetUser() user: any,
    @Param('tutorialSlug') tutorialSlug: string,
    @Param('quizSlug') quizSlug: string,
  ) {
    const data = await this.tutorialsService.getPublishedQuizBySlugs(
      tutorialSlug,
      quizSlug,
    );
    if (!data) throw new NotFoundException('Quiz not found');

    return data; // { tutorial, quiz }
  }

  @Post(':tutorialSlug/quizzes/:quizSlug/check')
  async checkQuizAnswer(
    @Param('tutorialSlug') tutorialSlug: string,
    @Param('quizSlug') quizSlug: string,
    @Body()
    body: {
      questionId: string;
      selectedOptionIds: string[];
    },
  ) {
    if (!body || !body.questionId || !Array.isArray(body.selectedOptionIds)) {
      throw new BadRequestException('Invalid payload');
    }
    const result = await this.tutorialsService.validateQuizQuestion(
      tutorialSlug,
      quizSlug,
      body.questionId,
      body.selectedOptionIds,
    );
    if (!result) throw new NotFoundException('Quiz or question not found');
    return result; // { correct, correctOptionIds, incorrectSelectedOptionIds }
  }

  @Get(':tutorialSlug/first-item')
  async getFirstItemByTutorialSlug(
    @Param('tutorialSlug') tutorialSlug: string,
  ) {
    const result =
      await this.tutorialsService.getFirstPublishedItemByTutorialSlug(
        tutorialSlug,
      );
    if (!result) throw new NotFoundException('First item not found');
    return result;
  }

  @Get('items/:itemId')
  async getItemById(@Param('itemId') itemId: string) {
    const data =
      await this.tutorialsService.getPublishedItemByIdWithNeighbors(itemId);
    if (!data) throw new NotFoundException('Item not found');
    return data; // { tutorial, section, item, previousItem, nextItem }
  }
}
