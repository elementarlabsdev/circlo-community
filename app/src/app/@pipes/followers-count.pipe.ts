import { inject, Pipe, PipeTransform } from '@angular/core';
import { SubscriptionStore } from '@store/subscription.store';
import { SubscriptionTarget } from '@model/interfaces';

@Pipe({
  name: 'followersCount',
  standalone: true
})
export class FollowersCountPipe implements PipeTransform {
  private _subscriptionStore = inject(SubscriptionStore);

  transform(target: SubscriptionTarget | any): number {
    const subscription = this._subscriptionStore.subscriptions().find(
      _ => _.id === target.id
    );

    if (subscription) {
      return subscription.followersCount;
    }

    return 0;
  }
}
