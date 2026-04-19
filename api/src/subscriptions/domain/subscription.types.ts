import { SubscriptionTargetType } from './entities/subscription.entity';

export interface ListSubscriptionsResult {
  items: Array<
    | { type: 'channel'; channel: any; subscription: any }
    | { type: 'topic'; topic: any; subscription: any }
  >;
  pagination: {
    totalItems: number;
    totalPages: number;
    pageSize: number;
    pageNumber: number;
  };
  subscriptions: any[];
  bookmarks: any[];
}

export type { SubscriptionTargetType };
