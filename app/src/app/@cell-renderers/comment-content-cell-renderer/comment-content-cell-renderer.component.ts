import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-comment-content-cell-renderer',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './comment-content-cell-renderer.component.html',
  styleUrl: './comment-content-cell-renderer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentContentCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input<any>();
  fieldData = input.required<string>();

  get discussionLink(): string {
    return `/discussion/${this.element()?.id}`;
  }
}
