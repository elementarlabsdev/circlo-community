export type SubscriptionTargetType = 'channel' | 'topic' | 'user';

export class SubscriptionEntity {
  constructor(
    public readonly id: string,
    public readonly followerId: string,
    public readonly targetType: SubscriptionTargetType,
    public readonly targetId: string,
    public readonly createdAt?: Date,
  ) {}
}
