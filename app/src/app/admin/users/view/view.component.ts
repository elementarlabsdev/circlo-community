import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsersApi } from '../users.api';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter/components/toolbar';
import { Divider } from '@ngstarter/components/divider';
import { Dicebear } from '@ngstarter/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';

@Component({
  selector: 'admin-users-view',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    Panel,
    PanelContent,
    PanelHeader,
    Icon,
    TranslocoModule,
    DatePipe,
    TitleCasePipe,
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle,
    Divider,
    Dicebear,
    ImageProxyPipe,
    DecimalPipe,
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(UsersApi);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  userId = this.route.snapshot.paramMap.get('id')!;
  user = signal<any>(null);
  loading = signal(true);

  constructor() {
    this.breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'admin',
        route: '/admin',
        name: this.translate.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'users',
        route: '/admin/users',
        name: this.translate.instant('breadcrumbs.admin.users'),
        type: 'link'
      },
      {
        id: 'view',
        name: this.translate.instant('breadcrumbs.admin.users.view'),
        type: null
      }
    ]);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.findById(this.userId).subscribe({
      next: (u) => {
        this.user.set(u);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
