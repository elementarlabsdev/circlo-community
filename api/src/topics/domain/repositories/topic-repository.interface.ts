import { TopicEntity } from '@/topics/domain/entities/topic.entity';

export const TOPIC_REPOSITORY = 'TOPIC_REPOSITORY';

export interface TopicRepositoryInterface {
  findById(id: string): Promise<TopicEntity | null>;
  findBySlug(slug: string): Promise<TopicEntity | null>;
  findAllOrdered(): Promise<TopicEntity[]>;
  search(
    query: string,
    page: number,
    pageSize: number,
  ): Promise<{ totalCount: number; items: TopicEntity[]; pageSize: number }>;
  isSlugTaken(slug: string, excludeId?: string): Promise<boolean>;
  create(topic: TopicEntity): Promise<void>;
  save(topic: TopicEntity): Promise<void>;
}
