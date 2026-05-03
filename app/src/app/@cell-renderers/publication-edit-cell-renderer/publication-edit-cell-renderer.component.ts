import { Component, inject, input } from '@angular/core';
import { DATA_VIEW, DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { RouterLink } from '@angular/router';
import { CanPipe } from '@directives/can.directive';
import { Action } from '@services/ability.service';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Tooltip } from '@ngstarter-ui/components/tooltip';

@Component({
  selector: 'app-publication-edit-cell-renderer',
  standalone: true,
  imports: [
    RouterLink,
    CanPipe,
    Button,
    Icon,
    Tooltip
  ],
  templateUrl: './publication-edit-cell-renderer.component.html',
  styleUrl: './publication-edit-cell-renderer.component.scss'
})
export class PublicationEditCellRendererComponent implements DataViewCellRenderer {
  private dataView = inject(DATA_VIEW);

  element = input<any>();
  columnDef = input<any>();
  fieldData = input<string>('');
  readonly Action = Action;

  unpublish() {
    this.columnDef().params?.onUnpublish(this.element(), this.dataView.api);
  }

  delete() {
    this.columnDef().params?.onDelete(this.element(), this.dataView.api);
  }
}
