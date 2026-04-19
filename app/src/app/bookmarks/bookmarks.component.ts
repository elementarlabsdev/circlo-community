import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionStore } from '@store/subscription.store';
import { Pagination } from '@model/interfaces';
import { PublicationComponent } from '@app/publication/publication.component';
import { BookmarkStore } from '@store/bookmark.store';
import { AppStore } from '@store/app.store';
import { PaginatorComponent } from '@app/paginator';
import { TranslocoPipe } from '@jsverse/transloco';
import { TutorialPreview } from '@app/tutorial-preview/tutorial-preview';
import { ThreadComponent } from '@app/thread/thread.component';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [
    PublicationComponent,
    PaginatorComponent,
    TranslocoPipe,
    TutorialPreview,
    ThreadComponent,
  ],
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.scss'
})
export class BookmarksComponent implements OnInit {
  private _api = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _subscriptionStore = inject(SubscriptionStore);
  private _bookmarkStore = inject(BookmarkStore);
  private _appStore = inject(AppStore);

  loading = signal(true);
  bookmarks = signal<any[]>([]);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;
  reactions: { [prop: string]: any };

  ngOnInit() {
    this._load();
  }

  onPageChanged(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this._load();
  }

  private _load(): void {
    this.loading.set(true);
    this._api
      .get('bookmarks', {
        params: {
          pageNumber: this.pageNumber
        }
      })
      .subscribe((res: any) => {
        this._subscriptionStore.set(res.subscriptions);
        this._bookmarkStore.set(res.bookmarks);
        this.reactions = res.reactions;
        if (res.reactions) {
          this._appStore.setReactions(res.reactions);
        }
        this.bookmarks.set(res.items);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      })
    ;
  }
}
