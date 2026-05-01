import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommentsApi } from '../comments.api';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter/components/toolbar';
import { Divider } from '@ngstarter/components/divider';
import { AdminQualityScoreComponent } from '../../shared/quality-score/quality-score.component';

import { Comment } from '@model/interfaces';

@Component({
  selector: 'admin-comment-view',
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
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle,
    Divider,
    AdminQualityScoreComponent
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(CommentsApi);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslocoService);

  commentId = this.route.snapshot.paramMap.get('id')!;
  comment = signal<Comment | null>(null);
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
        id: 'comments',
        route: '/admin/comments',
        name: this.translate.translate('breadcrumbs.comments'),
        type: 'link'
      },
      {
        id: 'view',
        name: this.translate.translate('breadcrumbs.admin.comments.view'),
        type: null
      }
    ]);
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getOne(this.commentId).subscribe({
      next: (res) => {
        this.comment.set(res.comment);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  back() {
    this.router.navigate(['/admin/comments']);
  }
}
