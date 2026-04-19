import { Module, Global } from '@nestjs/common';
import { TopicsController } from '@/topics/infrastructure/controllers/topics.controller';
import { AdminTopicsController } from '@/topics/infrastructure/controllers/admin/admin-topics.controller';
import { CommonPublicationListService } from '@/publications/application/services/common-publication-list.service';
import { TopicsService } from '@/topics/application/services/topics.service';
import { TopicListService } from '@/topics/application/services/topic-list.service';
import { AdminTopicListService } from '@/topics/application/services/admin-topic-list.service';
import { AdminTopicsTableService } from '@/topics/application/services/admin-topics-table.service';
import { TopicsDataTableService } from '@/topics/application/services/topics-data-table.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { TOPIC_REPOSITORY } from '@/topics/domain/repositories/topic-repository.interface';
import { TopicsPrismaRepository } from '@/topics/infrastructure/persistence/topics.prisma.repository';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { ReactionsService } from '@/reactions/application/services/reactions.service';

@Global()
@Module({
  imports: [],
  controllers: [
    TopicsController,
    // Admin
    AdminTopicsController,
  ],
  providers: [
    TopicsService,
    CommonPublicationListService,
    SubscriptionsService,
    ReactionsService,
    TopicListService,
    AdminTopicListService,
    AdminTopicsTableService,
    TopicsDataTableService,
    { provide: DataTableService, useClass: TopicsDataTableService },
    { provide: TOPIC_REPOSITORY, useClass: TopicsPrismaRepository },
  ],
  exports: [TopicsService, TOPIC_REPOSITORY],
})
export class TopicsModule {}
