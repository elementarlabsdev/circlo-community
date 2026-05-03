import { Component, computed, input, numberAttribute, OnInit, output } from '@angular/core';
import {  Button } from '@ngstarter-ui/components/button';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'ngs-paginator',
  exportAs: 'ngsPaginator',
  standalone: true,
  imports: [

    RouterLink,
    TranslocoPipe,
    Button,
  ],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss',
  host: {
    'class': 'ngs-paginator'
  }
})
export class PaginatorComponent {
  route = input.required<string>();
  totalItems = input.required({
    transform: numberAttribute
  });
  pageNumber = input.required({
    transform: numberAttribute
  });
  pageSize = input.required({
    transform: numberAttribute
  });
  totalPages = computed(() => {
    return Math.ceil(this.totalItems() / this.pageSize());
  });
  prevPageNumber = computed(() => {
    return this.pageNumber() > 1 ? this.pageNumber() - 1 : 1;
  });
  nextPageNumber = computed(() => {
    return this.pageNumber() < this.totalPages() ? this.pageNumber() + 1 : this.totalPages();
  });

  readonly pageChanged = output<number>();

  setPage(pageNumber: number): void {
    this.pageChanged.emit(pageNumber);
  }
}
