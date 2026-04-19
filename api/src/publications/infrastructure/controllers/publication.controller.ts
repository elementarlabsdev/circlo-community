import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { LicenseTypeService } from '@/platform/application/services/license-type.service';
import { BookmarksService } from '@/bookmarks/application/services/bookmarks.service';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { PublicationsService } from '@/publications/application/services/publications.service';
import { CommonPublicationListService } from '@/publications/application/services/common-publication-list.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { TargetReactionsService } from '@/reactions/application/services/target-reactions.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { PoliciesGuard } from '@/identity/infrastructure/guards/policies.guard';
import { CheckPolicies } from '@/common/infrastructure/decorators/check-policies.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { Publication } from '@/publications/domain/entities/publication.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('p')
export class PublicationController {
  constructor(
    private _publicationsService: PublicationsService,
    private _publicationListService: CommonPublicationListService,
    private _publicationReactionsService: TargetReactionsService,
    private _subscriptionsService: SubscriptionsService,
    private _bookmarksService: BookmarksService,
    private licenseTypeService: LicenseTypeService,
    private prisma: PrismaService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Get(':slug')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, 'Publication'))
  async view(
    @GetUser() user: any,
    @Req() request: any,
    @Param('slug') slug: string,
  ) {
    const publication = await this._publicationsService.findBySlugOrFail(slug);

    if (user) {
      await this.recommendationQueue.add('update-user-interests', {
        userId: user.id,
        targetId: publication.id,
        targetType: 'publication',
      });
    }
    const reactions = await this._publicationReactionsService.getReactions(
      publication.id,
      'publication',
      user,
    );

    let channelSubscription = null;

    if (publication.channel) {
      channelSubscription = await this._subscriptionsService.get(
        user,
        publication.channel,
      );
    }

    const authorSubscription = await this._subscriptionsService.get(
      user,
      publication.author,
    );

    const bookmark = await this._bookmarksService.get(
      user,
      publication.id,
      'publication',
    );
    const morePublicationsOfChannel = publication.channel
      ? await this._publicationListService.findMorePublicationsOfChannel(
          publication,
          publication.channel,
        )
      : [];
    // await this._publicationsService.increaseReaders(publication, request.user);
    await this._publicationsService.increaseViews(publication);
    const readNext =
      await this._publicationsService.readNextOfPublication(publication);
    const licenseTypes = await this.licenseTypeService.findAll();
    const donationLinks = await this.prisma.donationLink.findMany({
      where: { userId: publication.authorId },
      orderBy: { position: 'asc' },
    });

    let hasAccess = true;
    if (publication.channel) {
      const channel = publication.channel as any;
      const accessType = channel.accessType;
      const visibilityType = channel.visibility?.type;

      if (visibilityType === 'private') {
        hasAccess = channelSubscription?.isFollowing || false;
      } else if (accessType === 'subscribers') {
        hasAccess = channelSubscription?.isFollowing || false;
      }
    }

    const isPurchased = false; // Always free now

    if (!hasAccess && !isPurchased) {
      // Clear content blocks if no access
      (publication as any).contentBlocks = [];
      (publication as any).textContent = '';
      (publication as any).isLocked = true;
    }

    return {
      publication,
      reactions,
      channelSubscription,
      bookmark,
      morePublicationsOfChannel,
      authorSubscription,
      readNext,
      licenseTypes,
      donationLinks,
      isPurchased,
      hasAccess,
    };
  }
}
