import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-boolean-cell-renderer',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './boolean-cell-renderer.component.html',
  styleUrl: './boolean-cell-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooleanCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input<any>();
  fieldData = input.required<boolean>();
}
