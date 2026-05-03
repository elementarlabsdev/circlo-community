import { Component, inject, input, OnInit } from '@angular/core';
import { Widget } from '@model/interfaces';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { RouterLink } from '@angular/router';
import { SubscriptionStore } from '@store/subscription.store';
import { FollowersCountComponent } from '@app/followers-count/followers-count.component';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-recommended-channels',
  imports: [
    SubscriptionComponent,
    RouterLink,
    FollowersCountComponent,
    Dicebear,
    ImageProxyPipe,
    TranslocoPipe
  ],
  templateUrl: './recommended-channels.widget.html',
  styleUrl: './recommended-channels.widget.scss'
})
export class RecommendedChannelsWidget implements OnInit {
  private _subscriptionStore = inject(SubscriptionStore);
  widget = input.required<Widget>();

  ngOnInit() {
    this._subscriptionStore.set(this.widget().data.subscriptions);
  }
}
