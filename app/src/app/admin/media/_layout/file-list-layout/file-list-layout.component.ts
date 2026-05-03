import { Component, inject, output, viewChild } from '@angular/core';
import { MediaApi } from '@services/media.api';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter-ui/components/data-view';

@Component({
  selector: 'app-file-list-layout',
  standalone: true,
  imports: [DataView],
  templateUrl: './file-list-layout.component.html',
  styleUrl: './file-list-layout.component.scss'
})
export class FileListLayout {
  private readonly api = inject(MediaApi);

  // Access underlying datatable to trigger reloads from parent
  readonly datatable = viewChild<DataView<any>>('datagridRef');

  // Called by parent to reload the table data
  refresh(): void {
    (this.datatable()?.api as any)?.refresh();
  }

  // Optional: clear selection in the table
  clearSelection(): void {
    // DataView might have different way to uncheck all, but usually it's through API
    (this.datatable()?.api as any)?.uncheckAll?.();
  }

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Name',
      field: 'name',
    },
    {
      name: 'Extension',
      field: 'extension',
    },
    {
      name: 'MIME Type',
      field: 'mimeType',
    },
    {
      name: 'Size (bytes)',
      field: 'size',
    },
    {
      name: 'Created',
      field: 'createdAt',
      cellRenderer: 'date'
    }
  ];

  cellRenderers = [
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer')
      .then(m => m.DateCellRenderer)),
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

  readonly filesChecked = output();

  onFilesChecked(event: any) {
    this.filesChecked.emit(event);
  }
}
