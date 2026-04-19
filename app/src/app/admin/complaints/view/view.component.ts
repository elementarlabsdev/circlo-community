import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { ComplaintsApi } from '../complaints.api';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'admin-complaint-view',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, Panel, PanelHeader, PanelContent, Button, Icon],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss',
})
export class ViewComponent implements OnInit {
  private readonly api = inject(ComplaintsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  loaded = signal(false);
  complaint = signal<any | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.byId(id).subscribe({
      next: (res) => {
        this.complaint.set(res?.complaint);
        this.setupBreadcrumbs(res?.complaint);
        this.loaded.set(true);
      },
      error: () => {
        this.loaded.set(true);
      },
    });
  }

  setupBreadcrumbs(c: any) {
    this.breadcrumbsStore.setBreadcrumbs([
      { id: 'home', route: '/', type: 'link', iconName: 'fluent:home-24-regular' },
      {
        id: 'admin',
        route: '/admin',
        name: this.translate.instant('breadcrumbs.admin'),
        type: 'link',
      },
      {
        id: 'complaints',
        name: this.translate.instant('breadcrumbs.complaints') || 'Complaints',
        route: '/admin/complaints',
        type: 'link',
      },
      {
        id: 'complaint',
        name: c?.name || (c ? `${c.targetType}:${c.targetId}` : '…'),
        type: null,
      },
    ]);
  }

  backToList() {
    this.router.navigate(['/admin/complaints']);
  }
}
