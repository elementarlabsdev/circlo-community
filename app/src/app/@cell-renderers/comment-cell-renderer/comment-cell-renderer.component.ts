import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { Author } from '@model/interfaces';
import { SafeHtmlPipe } from '@ngstarter/components/core';

@Component({
  selector: 'app-comment-cell-renderer',
  imports: [
    SafeHtmlPipe
  ],
  templateUrl: './comment-cell-renderer.component.html',
  styleUrl: './comment-cell-renderer.component.scss'
})
export class CommentCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input.required();
  fieldData = input.required<Author>();
}
