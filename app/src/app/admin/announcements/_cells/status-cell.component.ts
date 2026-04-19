import { Component, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'admin-announcement-status-cell',
  standalone: true,
  template: `
    <div class="flex items-center h-full">
      @if (value()?.type === 'active') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-green-500/10
                  font-medium text-green-600 text-xs">{{ value()?.name }}
        </div>
      } @else if (value()?.type === 'draft') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full border border-border
                  font-medium text-xs">{{ value()?.name }}
        </div>
      } @else if (value()?.type === 'expired') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-red-500/10
                  font-medium text-xs text-red-600">{{ value()?.name }}
        </div>
      } @else if (value()?.type === 'scheduled') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-blue-500/10
                  font-medium text-xs text-blue-600">{{ value()?.name }}
        </div>
      } @else {
        {{ value()?.name }}
      }
    </div>
  `,
})
export class StatusCellComponent implements ICellRendererAngularComp {
  readonly value = signal<any>(null);

  agInit(params: ICellRendererParams): void {
    this.value.set(params.value);
  }

  refresh(params: ICellRendererParams): boolean {
    this.value.set(params.value);
    return true;
  }
}
