import { Component, OnInit, inject, signal } from '@angular/core';
import { SettingsService } from '@services/settings.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { TutorialInterface } from '@model/interfaces';
import { Accordion, ExpansionPanel, ExpansionPanelHeader } from '@ngstarter-ui/components/expansion';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { TranslocoPipe, TranslocoModule } from '@jsverse/transloco';
import { ReadingTime } from '@app/reading-time/reading-time';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { FollowersCountComponent } from '@app/followers-count/followers-count.component';
import { PublicationsCountComponent } from '@app/publications-count/publications-count.component';
import { TutorialsCount } from '@app/tutorials-count/tutorials-count';
import { Divider } from '@ngstarter-ui/components/divider';

@Component({
  imports: [
    RouterLink,
    Button,
    Icon,
    ExpansionPanelHeader,
    ExpansionPanel,
    Accordion,
    Dicebear,
    TranslocoModule,
    ReadingTime,
    ImageProxyPipe,
    SubscriptionComponent,
    FollowersCountComponent,
    PublicationsCountComponent,
    TutorialsCount,
    Divider
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss'
})
export class Overview implements OnInit {
  private api = inject(ApiService);
  private _settingsService = inject(SettingsService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(SnackBar);

  loaded = signal(false);
  tutorial = signal<TutorialInterface | null>(null);
  firstItem = signal<any>(null);
  isPurchased = signal(false);
  allowPublications = this._settingsService.setting('contentAllowPublications', true);
  allowTutorials = this._settingsService.setting('contentAllowTutorials', true);

  get tutorialSlug(): string {
    return this.route.snapshot.params['tutorialSlug'];
  }

  ngOnInit(): void {
    this.api.get(`tutorials/slug/${this.tutorialSlug}`).subscribe((res: any) => {
      this.firstItem.set(res.firstItem.item);
      this.tutorial.set(res.tutorial);
      this.isPurchased.set(res.isPurchased);
      this.loaded.set(true);
    });
  }

  buy() {
    this.api.post(`payments/checkout/tutorial/${this.tutorial()?.id}`).subscribe({
      next: (res: any) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err: any) => {
        this.snackBar.open('Error starting checkout', 'Close', { duration: 3000 });
      }
    });
  }

  getUrl() {
    return ['/tutorial', this.tutorial()?.slug, this.firstItem().type, this.firstItem()[this.firstItem().type]?.slug];
  }
}
