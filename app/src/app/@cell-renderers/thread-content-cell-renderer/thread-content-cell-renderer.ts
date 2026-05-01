import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {TranslocoPipe} from "@jsverse/transloco";

@Component({
  selector: 'app-thread-content-cell-renderer',
  imports: [
    RouterLink,
    TranslocoPipe
  ],
  templateUrl: './thread-content-cell-renderer.html',
  styleUrl: './thread-content-cell-renderer.scss',
})
export class ThreadContentCellRenderer {
  element = input<any>();
  columnDef = input<any>();
  fieldData = input.required<string>();

  get threadLink(): string {
    return `/thread/${this.element()?.id}`;
  }
}
