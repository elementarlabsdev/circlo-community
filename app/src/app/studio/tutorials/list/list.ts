import { Component, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ApiService } from '@services/api.service';
import { FormsModule } from '@angular/forms';
import { Pagination, TutorialInterface } from '@model/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { CommonModule } from '@angular/common';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import {
  PanelContent,
  Panel,
  PanelFooter,
  PanelHeader
} from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import {
  EmptyStateActions,
  EmptyState,
  EmptyStateContent, EmptyStateIcon
} from '@ngstarter-ui/components/empty-state';
import { CanDirective } from '@directives/can.directive';
import { Card, CardActions } from '@ngstarter-ui/components/card';
import { Chip, ChipListbox } from '@ngstarter-ui/components/chips';
import { Action } from '@services/ability.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    Button,
    Icon,
    TranslocoPipe,
    TimeAgoPipe,
    Panel,
    PanelHeader,
    PanelContent,
    ScrollbarArea,
    PanelFooter,
    EmptyStateActions,
    EmptyState,
    EmptyStateContent,
    EmptyStateIcon,
    CanDirective,
    Card,
    CardActions,
    Chip,
    ChipListbox,
  ],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List implements OnInit, OnDestroy {
  private _apiService = inject(ApiService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _snackBar = inject(SnackBar);
  private _confirmManager = inject(ConfirmManager);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _destroy$ = new Subject<void>();
  private _searchSubject = new Subject<string>();

  private _scrollbar = viewChild(ScrollbarArea);

  filtersEnabled = signal(false);
  loaded = signal(false);

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'studio',
        name: 'breadcrumbs.studio',
        route: '/studio',
        type: 'link',
      },
      {
        name: 'breadcrumbs.tutorials',
        id: 'tutorials',
        type: null
      }
    ]);
  }

  search = '';
  channel = 'all';
  topic = 'all';
  status = 'all';
  sort = 'newest';

  totalItemsCount = signal(-1);

  pagination: Pagination = {
    pageSize: 20,
    pageNumber: 1,
    totalItemsCount: 0,
    totalPages: 0,
    totalItems: 0
  };
  loading = true;
  data: TutorialInterface[] = [];
  topics: any[] = [];
  channels: any[] = [];

  fetchTutorials = (params?: any) =>
    this._apiService.post('studio/tutorials/list', params);

  edit(tutorial: any) {
    this._router.navigateByUrl(`/studio/tutorials/${tutorial.id}/overview`);
  }

  ngOnInit() {
    this.loadData();
    this._searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.onFilterChange();
      });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }


  loadData() {
    this.loading = true;
    const params: any = {
      page: this.pagination.pageNumber,
      pageSize: this.pagination.pageSize,
      q: this.search,
      sortBy: this.sort === 'newest' ? 'createdAt' : 'updatedAt',
      sortDir: 'desc'
    };

    if (this.channel !== 'all') {
      params['filter_channelId'] = this.channel;
    }

    if (this.topic !== 'all') {
      params['filter_topicId'] = this.topic;
    }

    if (this.status !== 'all') {
      params['filter_status'] = this.status;
    }

    this.fetchTutorials(params).subscribe((res: any) => {
      if (this.totalItemsCount() === -1) {
        this.totalItemsCount.set(res.total);
      }

      this.data = res.data;
      this.topics = res.topics;
      this.channels = res.channels;
      this.loading = false;
      this.pagination.totalItems = res.total;
      this.pagination.totalPages = Math.ceil(res.total / this.pagination.pageSize);

      if (!this.loaded()) {
        this.loaded.set(true);
      }
    });
  }

  onFilterChange() {
    this.pagination.pageNumber = 1;
    this.loadData();
  }

  onSearchChange() {
    this._searchSubject.next(this.search);
  }

  goToFirst() {
    this.pagination.pageNumber = 1;
    this.loadData();
  }

  prevPage() {
    this.pagination.pageNumber--;
    this.loadData();
  }

  nextPage() {
    this.pagination.pageNumber++;
    this.loadData();
  }

  goToLast() {
    this.pagination.pageNumber = this.pagination.totalPages;
    this.loadData();
  }

  canPrev(): boolean {
    return this.pagination.pageNumber > 1;
  }

  canNext(): boolean {
    return this.pagination.pageNumber < this.pagination.totalPages;
  }

  showingFrom(): number {
    return (this.pagination.pageNumber - 1) * this.pagination.pageSize + 1;
  }

  showingTo(): number {
    return Math.min(this.pagination.pageNumber * this.pagination.pageSize, this.pagination.totalItems);
  }

  createTutorial(): void {
    this._apiService
      .post('studio/tutorials')
      .subscribe((res: any) => {
        this._router.navigateByUrl(`/studio/tutorials/${res.tutorial.id}/content`);
      })
    ;
  }

  delete(tutorial: TutorialInterface): void {
    const confirmDef = this._confirmManager.open({
      title: 'Delete tutorial',
      description: 'Are you sure you want to delete this tutorial? This action cannot be undone.'
    });
    confirmDef.confirmed.subscribe(() => {
      this._apiService
        .delete(`studio/tutorials/${tutorial.id}`)
        .subscribe(res => {
          this.loadData();
          this._snackBar.open('Deleted!', 'OK', {
            duration: 3000
          });
        })
      ;
    });
  }

  unpublish(tutorial: TutorialInterface): void {
    const confirmDef = this._confirmManager.open({
      title: 'Unpublish tutorial',
      description: 'Are you sure you want to unpublish this tutorial?'
    });
    confirmDef.confirmed.subscribe(() => {
      this._apiService
        .post(`studio/tutorials/${tutorial.id}/unpublish`)
        .subscribe(res => {
          this._snackBar.open('Unpublished!', 'OK', {
            duration: 3000
          });
          this.loadData();
        })
      ;
    });
  }

  toggleFilters(): void {
    this.filtersEnabled.set(!this.filtersEnabled());

    if (this.filtersEnabled()) {
      this._scrollbar()?.scrollableContentRef().nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  protected readonly Action = Action;
}
