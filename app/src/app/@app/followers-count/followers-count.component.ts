import { Component, inject, input, numberAttribute } from '@angular/core';
import { SubscriptionStore } from '@store/subscription.store';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-followers-count',
  standalone: true,
  imports: [
    TranslocoPipe
  ],
  templateUrl: './followers-count.component.html',
  styleUrl: './followers-count.component.scss'
})
export class FollowersCountComponent {
  private _subscriptionStore = inject(SubscriptionStore);

  count = input.required({
    transform: numberAttribute
  });
}
