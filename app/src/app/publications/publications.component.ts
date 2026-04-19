import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Pagination, Publication } from '@model/interfaces';
import { PublicationComponent } from '@app/publication/publication.component';
import { ActivatedRoute } from '@angular/router';
import { PaginatorComponent } from '@app/paginator';
import { SubscriptionStore } from '@store/subscription.store';
import { BookmarkStore } from '@store/bookmark.store';
import { AppStore } from '@store/app.store';
import { TranslocoPipe } from '@jsverse/transloco';
import { PublicationSkeletonComponent } from '@app/publication-skeleton/publication-skeleton.component';

@Component({
  standalone: true,
  imports: [
    PublicationComponent,
    PaginatorComponent,
    TranslocoPipe,
    PublicationSkeletonComponent
  ],
  templateUrl: './publications.component.html',
  styleUrl: './publications.component.scss'
})
export class PublicationsComponent implements OnInit {
  private _apiService = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _subscriptionStore = inject(SubscriptionStore);
  private _bookmarkStore = inject(BookmarkStore);
  private _appStore = inject(AppStore);

  loaded = signal(false);
  publications = signal<Publication[]>([]);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;
  reactions: { [prop: string]: any };
  skeleton = [1, 2, 3, 4, 5];

  ngOnInit() {
    this._load();
  }

  onPageChanged(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this._load();
  }

  private _load(): void {
    this.loaded.set(false);
    this._apiService
      .get('publications', {
        params: {
          pageNumber: this.pageNumber
        }
      })
      .subscribe((res: any) => {
        this._subscriptionStore.set(res.subscriptions);
        this._bookmarkStore.set(res.bookmarks);
        this.publications.set(res.items);
        this.pagination.set(res.pagination);
        this.loaded.set(true);
        this.reactions = res.reactions;
        if (res.reactions) {
          this._appStore.setReactions(res.reactions);
        }
      })
    ;
  }
}
