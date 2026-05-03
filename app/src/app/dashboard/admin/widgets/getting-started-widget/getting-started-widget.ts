import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { TranslateService } from '@services/translate.service';
import { TranslocoModule } from '@jsverse/transloco';

interface GettingStartedItem {
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly link: string;
}

@Component({
  selector: 'app-getting-started-widget',
  imports: [
    RouterLink,
    Icon,
    Button,
    TranslocoModule
  ],
  templateUrl: './getting-started-widget.html',
  styleUrl: './getting-started-widget.scss',
})
export class GettingStartedWidget implements OnInit {
  private _translate = inject(TranslateService);

  widget = input<any>();
  loaded = signal(false);
  data = signal<any>(null);
  isExpanded = signal(true);
  items = signal<readonly GettingStartedItem[]>([]);

  ngOnInit() {
    this.items.set([
      {
        icon: 'fluent:hat-graduation-24-regular',
        title: this._translate.instant('admin.dashboard.widgets.gettingStarted.identity.title'),
        subtitle: this._translate.instant('admin.dashboard.widgets.gettingStarted.identity.subtitle'),
        link: '/admin/settings/identity',
      },
      {
        icon: 'fluent:color-24-regular',
        title: this._translate.instant('admin.dashboard.widgets.gettingStarted.theme.title'),
        subtitle: this._translate.instant('admin.dashboard.widgets.gettingStarted.theme.subtitle'),
        link: '/admin/settings/branding',
      },
      {
        icon: 'fluent:money-24-regular',
        title: this._translate.instant('admin.dashboard.widgets.gettingStarted.payment.title'),
        subtitle: this._translate.instant('admin.dashboard.widgets.gettingStarted.payment.subtitle'),
        link: '/admin/monetization',
      },
      {
        icon: 'fluent:mail-24-regular',
        title: this._translate.instant('admin.dashboard.widgets.gettingStarted.emailSettings.title'),
        subtitle: this._translate.instant('admin.dashboard.widgets.gettingStarted.emailSettings.subtitle'),
        link: '/admin/settings/mail',
      },
      {
        icon: 'fluent:alert-24-regular',
        title: this._translate.instant('admin.dashboard.widgets.gettingStarted.fileStorageSettings.title'),
        subtitle: this._translate.instant('admin.dashboard.widgets.gettingStarted.fileStorageSettings.subtitle'),
        link: '/admin/settings/file-storage',
      },
    ]);
    this.loaded.set(true);
  }
}
