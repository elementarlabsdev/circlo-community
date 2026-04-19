import { Component, input } from '@angular/core';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { Channel } from '@model/interfaces';
import { RouterLink } from '@angular/router';
import { ImageProxyPipe } from '../../pipes/image-proxy.pipe';
import { PublicationsCountComponent } from '@app/publications-count/publications-count.component';
import { Dicebear } from '@ngstarter/components/avatar';
import { TutorialsCount } from '@app/tutorials-count/tutorials-count';
import { Divider } from '@ngstarter/components/divider';

@Component({
  selector: 'app-channel',
  imports: [
    SubscriptionComponent,
    RouterLink,
    ImageProxyPipe,
    PublicationsCountComponent,
    Dicebear,
    TutorialsCount,
    Divider
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent {
  channel = input.required<Channel>();
}
