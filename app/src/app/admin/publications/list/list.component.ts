import { Component, inject, signal } from '@angular/core';
import { PublicationsApi } from '../publications.api';
import { FormsModule } from '@angular/forms';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import {
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  cellRenderer, DataViewGetRowsParams, DataViewAPI
} from '@ngstarter-ui/components/data-view';
import { AppStore } from '@store/app.store';
import { TranslateService } from '@services/translate.service';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    DataView,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private readonly api = inject(PublicationsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(SnackBar);
  private readonly confirmManager = inject(ConfirmManager);
  private readonly appStore = inject(AppStore);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  loading = signal(false);

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Title',
      field: 'title',
      sortable: true,
      cellRenderer: 'title',
    },
    {
      name: 'Published',
      field: 'publishedAt',
      cellRenderer: 'date',
      sortable: true,
    },
    {
      name: 'Author',
      field: 'author',
      cellRenderer: 'author',
      sortable: true,
    },
    {
      name: 'Actions',
      field: 'actions',
      cellRenderer: 'actions',
      width: '200px',
      pinned: true,
      pinAlign: 'end',
      params: {
        onUnpublish: (p: any, api: DataViewAPI) => this.unpublish(p, api),
        onDelete: (p: any, api: DataViewAPI) => this.delete(p, api),
      }
    }
  ];

  cellRenderers = [
    cellRenderer('title', () => import('@cell-renderers/publication-title-cell-renderer/publication-title-cell-renderer')
      .then(m => m.PublicationTitleCellRenderer)),
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer')
      .then(m => m.DateCellRenderer)),
    cellRenderer('author', () => import('@cell-renderers/publication-author-cell-renderer/publication-author-cell-renderer.component')
      .then(m => m.PublicationAuthorCellRendererComponent)),
    cellRenderer('actions', () => import('@cell-renderers/publication-edit-cell-renderer/publication-edit-cell-renderer.component')
      .then(m => m.PublicationEditCellRendererComponent)),
  ];

  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      this.api.paginate({
        page: params.page + 1,
        pageSize: params.pageSize,
        globalFilter: params.filterModel,
        globalSort: params.sortModel,
      }).subscribe({
        next: (res: any) => {
          params.successCallback(res.data, res.total);
        },
        error: () => params.failCallback()
      });
    }
  };

  constructor() {
    this.appStore.setTitle(this.route.snapshot.title || '');
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
        id: 'publications',
        name: this.translate.instant('breadcrumbs.publications'),
        route: '/admin/publications',
        type: null
      }
    ]);
  }

  view(pub: any) {
    // navigate to public view or editor if needed; placeholder
    // No-op for now
  }

  edit(pub: any) {

  }

  unpublish(pub: any, api: DataViewAPI) {
    const confirmDef = this.confirmManager.open({
      title: 'Unpublish publication',
      description: 'Are you sure you want to unpublish this publication?'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.unpublish(pub.hash).subscribe({
        next: () => {
          this.snack.open('Unpublished!', 'OK', {duration: 2000});
          api.refresh();
        },
        error: () => this.snack.open('Failed', undefined, {duration: 3000})
      });
    });
  }

  delete(pub: any, api: DataViewAPI) {
    const confirmDef = this.confirmManager.open({
      title: 'Delete publication',
      description: 'Deletion is not reversible, and the publication will be completely deleted.'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(pub.hash).subscribe({
        next: () => {
          this.snack.open('Deleted!', 'OK', {duration: 2000});
          api.refresh();
        },
        error: () => this.snack.open('Delete failed', undefined, {duration: 3000})
      });
    });
  }
}
