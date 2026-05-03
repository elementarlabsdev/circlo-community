import { Component, input } from '@angular/core';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { Topic } from '@model/interfaces';
import { RouterLink } from '@angular/router';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '../../pipes/image-proxy.pipe';
import { PublicationsCountComponent } from '@app/publications-count/publications-count.component';
import { TutorialsCount } from '@app/tutorials-count/tutorials-count';
import { Divider } from '@ngstarter-ui/components/divider';

@Component({
  selector: 'app-topic',
  standalone: true,
  imports: [
    SubscriptionComponent,
    RouterLink,
    Dicebear,
    ImageProxyPipe,
    PublicationsCountComponent,
    TutorialsCount,
    Divider
  ],
  templateUrl: './topic.component.html',
  styleUrl: './topic.component.scss'
})
export class TopicComponent {
  topic = input.required<Topic>();
}
