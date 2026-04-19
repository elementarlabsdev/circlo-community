import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { CanDirective } from '@directives/can.directive';
import { Action } from '@services/ability.service';
import { Tooltip } from '@ngstarter/components/tooltip';

@Component({
  selector: 'app-tutorial-actions-cell-renderer',
  standalone: true,
  imports: [
    Button,
    Icon,
    TranslocoPipe,
    CanDirective,
    Tooltip
  ],
  template: `
    <div class="flex items-center gap-1 h-full">
      <button *can="Action.Update; subject: element()" ngsIconButton
              [ngsTooltip]="'table.action.unpublish' | transloco"
              (click)="onUnpublish()">
        <ngs-icon name="fluent:prohibited-24-regular"/>
      </button>
      <button *can="Action.Delete; subject: element()" ngsIconButton
              [ngsTooltip]="'table.action.delete' | transloco"
              (click)="onDelete()">
        <ngs-icon name="fluent:delete-24-regular"/>
      </button>
    </div>
  `,
})
export class TutorialActionsCellRenderer implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input<any>();
  fieldData = input<any>();
  readonly Action = Action;

  onUnpublish() {
    this.columnDef().params.onUnpublish(this.element());
  }

  onDelete() {
    this.columnDef().params.onDelete(this.element());
  }
}
