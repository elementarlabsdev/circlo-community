import { Component, input } from '@angular/core';
import { SafeHtmlPipe } from '@ngstarter/components/core';
import { RouterLink } from '@angular/router';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';

@Component({
  selector: 'app-comment-edit-cell-renderer',
  imports: [
    SafeHtmlPipe,
    RouterLink
  ],
  templateUrl: './comment-edit-cell-renderer.component.html',
  styleUrl: './comment-edit-cell-renderer.component.scss'
})
export class CommentEditCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<string>('');
}
