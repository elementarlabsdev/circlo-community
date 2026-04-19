import { Global, Module } from '@nestjs/common';
import { ChannelsController } from '@/channels/infrastructure/controllers/channels.controller';
import { StudioChannelsController } from '@/channels/infrastructure/controllers/studio-channels.controller';
import { CommonPublicationListService } from '@/publications/application/services/common-publication-list.service';
import { AdminChannelsController } from '@/channels/infrastructure/controllers/admin-channels.controller';
import { ChannelListService } from '@/channels/application/services/channel-list.service';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { ChannelsTableService } from '@/channels/application/services/channels-table.service';
import { ChannelsDataTableService } from '@/channels/application/services/channels-data-table.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { AdminChannelListService } from '@/channels/application/services/admin-channel-list.service';
import { CHANNEL_REPOSITORY } from '@/channels/domain/repositories/channel-repository.interface';
import { ChannelsPrismaRepository } from '@/channels/infrastructure/persistence/channels.prisma.repository';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { ReactionsService } from '@/reactions/application/services/reactions.service';

@Global()
@Module({
  imports: [],
  controllers: [
    ChannelsController,
    AdminChannelsController,
    StudioChannelsController,
  ],
  providers: [
    ReactionsService,
    CommonPublicationListService,
    SubscriptionsService,
    ChannelsService,
    ChannelListService,
    ChannelsTableService,
    ChannelsDataTableService,
    { provide: DataTableService, useClass: ChannelsDataTableService },
    AdminChannelListService,
    { provide: CHANNEL_REPOSITORY, useClass: ChannelsPrismaRepository },
  ],
  exports: [ChannelsService, ChannelListService, CHANNEL_REPOSITORY],
})
export class ChannelsModule {}
