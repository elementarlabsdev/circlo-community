import { Component, inject, signal } from '@angular/core';
import { PaginatorComponent } from '@app/paginator';
import { PublicationComponent } from '@app/publication/publication.component';
import { ApiService } from '@services/api.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionStore } from '@store/subscription.store';
import { BookmarkStore } from '@store/bookmark.store';
import { AppStore } from '@store/app.store';
import { Pagination, Publication } from '@model/interfaces';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-search',
  imports: [
    PaginatorComponent,
    PublicationComponent,
    TranslocoPipe,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  private _apiService = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _subscriptionStore = inject(SubscriptionStore);
  private _bookmarkStore = inject(BookmarkStore);
  private _appStore = inject(AppStore);

  query = signal(this._route.snapshot.queryParams['query']);
  loading = signal(true);
  publications = signal<Publication[]>([]);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;
  reactions: { [prop: string]: any };

  ngOnInit() {
    this._route
      .queryParams
      .subscribe(params => {
        this._load();
      });
  }

  onPageChanged(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this._load();
  }

  private _load(): void {
    this.loading.set(true);
    this._apiService
      .get('publications', {
        params: {
          query: this._route.snapshot.queryParams['query'],
          pageNumber: this.pageNumber
        }
      })
      .subscribe((res: any) => {
        this._subscriptionStore.set(res.subscriptions);
        this._bookmarkStore.set(res.bookmarks);
        this.publications.set(res.items);
        this.pagination.set(res.pagination);
        this.loading.set(false);
        this.reactions = res.reactions;
        if (res.reactions) {
          this._appStore.setReactions(res.reactions);
        }
      })
    ;
  }
}
