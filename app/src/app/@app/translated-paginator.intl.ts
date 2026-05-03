import { PaginatorIntl } from '@ngstarter-ui/components/paginator';
import { inject, Injectable } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';

@Injectable()
export class TranslatedPaginatorIntl extends PaginatorIntl {
  private translate = inject(TranslocoService);

  unsubscribe: Subject<void> = new Subject<void>();
  override ofLabel = 'of';

  constructor() {
    super();
    this.translate.langChanges$
      .pipe(
       takeUntil(this.unsubscribe),
      )
      .subscribe(() => {
        this.getAndInitTranslations();
      });

    this.getAndInitTranslations();
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getAndInitTranslations() {
    this.translate
      .selectTranslateObject([
        'paginator.items_per_page',
        'paginator.next_page',
        'paginator.previous_page',
        'paginator.first_page',
        'paginator.last_page',
        'paginator.of_label',
      ])
      .pipe(
        takeUntil(this.unsubscribe),
      )
      .subscribe((translation: any) => {
        this.itemsPerPageLabel =
          translation['paginator.items_per_page'] || this.itemsPerPageLabel;
        this.nextPageLabel = translation['paginator.next_page'] || this.nextPageLabel;
        this.previousPageLabel =
          translation['paginator.previous_page'] || this.previousPageLabel;
        this.firstPageLabel = translation['paginator.first_page'] || this.firstPageLabel;
        this.lastPageLabel = translation['paginator.last_page'] || this.lastPageLabel;
        this.ofLabel = translation['paginator.of_label'] || this.ofLabel;
        this.changes.next();
      });
  }

  override getRangeLabel = (
    page: number,
    pageSize: number,
    length: number,
  ) => {
    if (length === 0 || pageSize === 0) {
      return `0 ${this.ofLabel} ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length
         ? Math.min(startIndex + pageSize, length)
        : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${
      this.ofLabel
    } ${length}`;
  };
}
