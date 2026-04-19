import { SubscriptionEntity } from '@/subscriptions/domain/entities/subscription.entity';

export const SUBSCRIPTION_REPOSITORY = 'SUBSCRIPTION_REPOSITORY';

export interface SubscriptionRepositoryInterface {
  findPageByFollowerId(
    followerId: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<{
    entities: Pick<SubscriptionEntity, 'targetType' | 'targetId'>[];
    totalItems: number;
  }>;
}
