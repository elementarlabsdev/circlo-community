import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ThreadsApi } from '../threads.api';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { DatePipe } from '@angular/common';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter/components/toolbar';
import { Divider } from '@ngstarter/components/divider';
import { AdminCommentQualityScoreComponent } from '../../comments/view/comment-quality-score/comment-quality-score.component';
import { SafeHtmlPipe } from '@ngstarter/components/core';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'admin-threads-view',
  standalone: true,
  imports: [
    Panel,
    PanelContent,
    PanelHeader,
    TranslocoModule,
    DatePipe,
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle,
    Divider,
    AdminCommentQualityScoreComponent,
    SafeHtmlPipe,
    Button,
    Icon,
    RouterLink
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ThreadsApi);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslocoService);

  threadId = this.route.snapshot.paramMap.get('id')!;
  thread = signal<any | null>(null);
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
        name: this.translate.translate('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'threads',
        route: '/admin/threads',
        name: this.translate.translate('breadcrumbs.threads'),
        type: 'link'
      },
      {
        id: 'view',
        name: this.translate.translate('breadcrumbs.admin.threads.view'),
        type: null
      }
    ]);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getOne(this.threadId).subscribe({
      next: (res) => {
        this.thread.set(res.thread);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  back() {
    this.router.navigate(['/admin/threads']);
  }
}
