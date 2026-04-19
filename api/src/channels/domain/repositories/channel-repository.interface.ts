import { ChannelEntity } from '@/channels/domain/entities/channel.entity';

export const CHANNEL_REPOSITORY = 'CHANNEL_REPOSITORY';

export interface ChannelRepositoryInterface {
  findById(id: string): Promise<ChannelEntity | null>;
  findBySlug(slug: string): Promise<ChannelEntity | null>;
  findByOwnerId(ownerId: string): Promise<ChannelEntity | null>;
  findAllPublicOrdered(): Promise<ChannelEntity[]>;
  searchPublic(query: string, page: number, pageSize: number): Promise<{ totalCount: number; items: ChannelEntity[]; pageSize: number }>;
  create(channel: ChannelEntity): Promise<void>;
  save(channel: ChannelEntity): Promise<void>;
  isSlugTaken(slug: string, excludeId?: string): Promise<boolean>;
}
