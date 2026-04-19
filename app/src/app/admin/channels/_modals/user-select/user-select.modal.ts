import { Component, inject } from '@angular/core';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter/components/dialog';
import { Button } from '@ngstarter/components/button';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter/components/data-view';
import { UsersApi } from '@/admin/users/users.api';
import { User } from '@model/interfaces';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-user-select-modal',
  imports: [
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    DataView,
    TranslocoPipe
  ],
  template: `
    <h2 ngsDialogTitle>{{ (data.title || 'admin.channels.selectModerators') | transloco }}</h2>
    <div ngsDialogContent class="relative">
      <ngs-data-view
        #datagridRef
        [columnDefs]="columnDefs"
        [datasource]="datasource"
        [cellRenderers]="cellRenderers"
        [rowSelection]="data.multiple === false ? 'single' : 'multiple'"
        rowModelType="serverSide"
        [withPagination]="true"
        autoHeight
        withSelection
        (selectionChanged)="onSelectionChanged($event)"
        class="absolute inset-0"
      ></ngs-data-view>
    </div>
    <div ngsDialogActions class="border-t border-t-border">
      <button ngsButton (click)="cancel()">{{ 'common.cancel' | transloco }}</button>
      <button ngsButton="filled" (click)="apply()">{{ 'common.apply' | transloco }}</button>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class UserSelectModal {
  private dialogRef = inject(DialogRef);
  protected data = inject(DIALOG_DATA);
  private usersApi = inject(UsersApi);
  private translate = inject(TranslocoService);

  selectedUsers: User[] = this.data?.selectedUsers || [];

  get columnDefs(): DataViewColumnDef[] {
    return [
      {
        name: this.translate.translate('admin.users.name'),
        field: 'name',
        width: '300px',
        cellRenderer: 'user',
      },
      {
        name: this.translate.translate('admin.users.username'),
        field: 'username',
      },
      {
        name: this.translate.translate('admin.users.email'),
        field: 'email',
      }
    ];
  }

  cellRenderers = [
    cellRenderer('user', () => import('@cell-renderers/user-cell-renderer/user-cell-renderer.component').then(m => m.UserCellRenderer)),
  ];

  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      this.usersApi.list({
        page: params.page + 1,
        pageSize: params.pageSize,
        globalFilter: params.filterModel,
        globalSort: params.sortModel,
      }).subscribe({
        next: (res: any) => {
          params.successCallback(res.data || [], res.total || 0);
        },
        error: (err) => {
          console.error('Error loading users:', err);
          params.failCallback();
        }
      });
    }
  };

  onSelectionChanged(event: any) {
    this.selectedUsers = event;
  }

  cancel() {
    this.dialogRef.close();
  }

  apply() {
    this.dialogRef.close(this.selectedUsers);
  }
}
