import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateIcon
} from '@ngstarter/components/empty-state';
import { Icon } from '@ngstarter/components/icon';
import { ButtonToggle, ButtonToggleGroup } from '@ngstarter/components/button-toggle';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { SubscriptionStore } from '@store/subscription.store';
import { Dicebear } from '@ngstarter/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';

@Component({
  selector: 'app-followers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslocoPipe,
    EmptyState,
    EmptyStateContent,
    EmptyStateIcon,
    Icon,
    ButtonToggle,
    ButtonToggleGroup,
    SubscriptionComponent,
    Icon,
    Dicebear,
    ImageProxyPipe
  ],
  templateUrl: './followers.html',
  styleUrl: './followers.scss',
})
export class Followers implements OnInit {
  private _apiService = inject(ApiService);
  private _subscriptionStore = inject(SubscriptionStore);

  originalFollowersCount = signal(0);
  loaded = signal(false);
  followers = signal<any[]>([]);
  totalItems = signal(0);
  loading = signal(false);
  q = signal('');
  page = signal(1);
  pageSize = signal(12);
  sortBy = signal('createdAt');
  sortDir = signal('desc');
  hasMore = computed(() => this.followers().length < this.totalItems());

  ngOnInit() {
    this.loadFollowers();
  }

  loadFollowers(append = false) {
    this.loading.set(true);
    const params = {
      page: this.page(),
      pageSize: this.pageSize(),
      q: this.q(),
      sortBy: this.sortBy(),
      sortDir: this.sortDir()
    };
    this._apiService.post('studio/followers/table', params).subscribe((res: any) => {
      if (!this.loaded()) {
        this.originalFollowersCount.set(res.data.length);
      }

      this._subscriptionStore.set(res.data.map((item: any) => {
        return {
          id: item.follower.id,
          isFollowing: item.isFollowing, // Assuming backend might provide this, or we'll handle it via store
          followersCount: item.follower.followersCount
        };
      }));

      if (append) {
        this.followers.update(prev => [...prev, ...res.data]);
      } else {
        this.followers.set(res.data);
      }
      this.totalItems.set(res.total);
      this.loading.set(false);
      this.loaded.set(true);
    });
  }

  onSearch() {
    this.page.set(1);
    this.loadFollowers();
  }

  loadMore() {
    this.page.update(p => p + 1);
    this.loadFollowers(true);
  }

  setSort(sortDir: string) {
    this.sortDir.set(sortDir);
    this.page.set(1);
    this.loadFollowers();
  }
}
