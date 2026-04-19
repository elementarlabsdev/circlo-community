import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Pagination, Topic } from '@model/interfaces';
import { PaginatorComponent } from '@app/paginator';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionStore } from '@store/subscription.store';
import { TopicComponent } from '@app/topic/topic.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { TopicSkeletonComponent } from '@app/topic-skeleton/topic-skeleton.component';

@Component({
  standalone: true,
  imports: [
    PaginatorComponent,
    TopicComponent,
    TranslocoPipe,
    TopicSkeletonComponent
  ],
  templateUrl: './topics.component.html',
  styleUrl: './topics.component.scss'
})
export class TopicsComponent implements OnInit {
  private _apiService = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _subscriptionStore = inject(SubscriptionStore);

  loaded = signal(false);
  topics = signal<Topic[]>([]);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;
  loadingTopics = [1, 2, 3, 4, 5, 6];

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
      .get('topics', {
        params: {
          pageNumber: this.pageNumber
        }
      })
      .subscribe((res: any) => {
        this._subscriptionStore.set(res.subscriptions);
        this.topics.set(res.items);
        this.pagination.set(res.pagination);
        this.loaded.set(true);
      })
    ;
  }
}
