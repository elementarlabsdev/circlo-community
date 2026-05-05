import { Global, Module } from '@nestjs/common';
import { PublicationResourceGuard } from '@/publications/infrastructure/guards/publication-resource.guard';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PublishPublicationProcessor } from '@/publications/application/queue-processors/publish-publication.processor';
import { PublicationsController } from '@/publications/infrastructure/controllers/publications.controller';
import { CommentReactionsService } from '@/comments/application/services/comment-reactions.service';
import { PublicationController } from '@/publications/infrastructure/controllers/publication.controller';
import { TopicsService } from '@/topics/application/services/topics.service';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { AdminPublicationListService } from '@/publications/application/services/admin-publication-list.service';
import { PublicationsService } from '@/publications/application/services/publications.service';
import { AdminPublicationsTableService } from '@/publications/application/services/admin-publications-table.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { AdminPublicationsDataTableService } from '@/publications/application/services/admin-publications-data-table.service';
import { StudioPublicationsDataTableService } from '@/publications/application/services/studio-publications-data-table.service';
import { StudioPublicationListService } from '@/publications/application/services/studio-publication-list.service';
import { StudioPublicationsTableService } from '@/publications/application/services/studio-publications-table.service';
import { AdminPublicationsController } from '@/publications/infrastructure/controllers/admin-publications.controller';
import { StudioPublicationsController } from '@/publications/infrastructure/controllers/studio-publications.controller';
import { PublicationsPrismaRepository } from '@/publications/infrastructure/persistence/publications.prisma.repository';
import { PUBLICATION_REPOSITORY } from '@/publications/domain/repositories/publication-repository.interface';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { ReactionsService } from '@/reactions/application/services/reactions.service';
import { FeaturedImageService } from '@/common/application/services/featured-image.service';
import { ActivityService } from '@/platform/application/services/activity.service';
import { StudioChannelListController } from '@/publications/infrastructure/controllers/studio.channel-list.controller';
import { TargetReactionsService } from '@/reactions/application/services/target-reactions.service';
import { CommonPublicationListService } from '@/publications/application/services/common-publication-list.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue(
      {
        name: 'publication-queue',
      },
      {
        name: 'recommendation-queue',
      },
    ),
  ],
  controllers: [
    PublicationsController,
    PublicationController,
    AdminPublicationsController,
    StudioPublicationsController,
    StudioChannelListController,
  ],
  providers: [
    // Guards for ABAC on publications
    PublicationResourceGuard,
    ChannelsService,
    AdminPublicationListService,
    FeaturedImageService,
    PublicationsService,
    AdminPublicationsTableService,
    AdminPublicationsDataTableService,
    StudioPublicationsDataTableService,
    { provide: DataTableService, useClass: AdminPublicationsDataTableService },
    StudioPublicationListService,
    StudioPublicationsTableService,
    CommonPublicationListService,
    SubscriptionsService,
    TargetReactionsService,
    ReactionsService,
    CommentReactionsService,
    TopicsService,
    ActivityService,
    PublishPublicationProcessor,
    // Repositories
    { provide: PUBLICATION_REPOSITORY, useClass: PublicationsPrismaRepository },
  ],
  exports: [PublicationsService, CommonPublicationListService],
})
export class PublicationsModule {}
