import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { SubscriptionTarget } from '@model/interfaces';

export interface SubscriptionState {
  subscriptions: SubscriptionTarget[];
}

const initialState: SubscriptionState = {
  subscriptions: []
};

export const SubscriptionStore = signalStore(
  {
    providedIn: 'root',
    protectedState: false
  },
  withState<SubscriptionState>(initialState),
  withMethods((store) => ({
    set(subscriptions: SubscriptionTarget[]): void {
      const currentSubscriptions = [...store.subscriptions()];
      subscriptions.forEach(newSub => {
        const index = currentSubscriptions.findIndex(s => s.id === newSub.id);
        if (index !== -1) {
          currentSubscriptions[index] = newSub;
        } else {
          currentSubscriptions.push(newSub);
        }
      });
      patchState(store, {
        subscriptions: currentSubscriptions
      });
    },
    add(targetId: string, type: string): void {
      const subscriptions = [...store.subscriptions()];
      const index = subscriptions.findIndex(_ => _.id === targetId);

      if (index !== -1) {
        const target = { ...subscriptions[index] };
        target.isFollowing = true;
        target.followersCount += 1;
        subscriptions[index] = target;
      } else {
        subscriptions.push({
          id: targetId,
          type,
          isFollowing: true,
          followersCount: 1
        });
      }

      patchState(store, {
        subscriptions
      });
    },
    remove(targetId: string): void {
      const subscriptions = [...store.subscriptions()];
      const index = subscriptions.findIndex(_ => _.id === targetId);

      if (index !== -1) {
        const target = { ...subscriptions[index] };
        target.isFollowing = false;
        target.followersCount -= 1;
        subscriptions[index] = target;
        patchState(store, {
          subscriptions
        });
      }
    },
    isFollowing(targetId: string): boolean {
      const subscription = store.subscriptions().find(_ => _.id === targetId);
      return !!subscription?.isFollowing;
    }
  }))
);

