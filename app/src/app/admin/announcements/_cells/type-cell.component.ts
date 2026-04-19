import { Component, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'admin-announcement-type-cell',
  standalone: true,
  template: `
    <div class="flex items-center h-full">
      <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-primary/10
                font-medium text-primary text-xs">{{ value()?.name }}
      </div>
    </div>
  `,
})
export class TypeCellComponent implements ICellRendererAngularComp {
  readonly value = signal<any>(null);

  agInit(params: ICellRendererParams): void {
    this.value.set(params.value);
  }

  refresh(params: ICellRendererParams): boolean {
    this.value.set(params.value);
    return true;
  }
}
