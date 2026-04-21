import { Component, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ApiService } from '@services/api.service';
import { FormsModule } from '@angular/forms';
import { Pagination, Publication } from '@model/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { CommonModule } from '@angular/common';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import {
  PanelContent,
  Panel,
  PanelFooter,
  PanelHeader
} from '@ngstarter/components/panel';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import {
  EmptyStateActions,
  EmptyState,
  EmptyStateContent, EmptyStateIcon
} from '@ngstarter/components/empty-state';
import { Card, CardActions, CardContent } from '@ngstarter/components/card';
import { Chip, ChipListbox } from '@ngstarter/components/chips';
import { CanDirective } from '@directives/can.directive';
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
    CardContent,
    Card,
    CardActions,
    Chip,
    ChipListbox,
    CanDirective,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit, OnDestroy {
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
        name: 'breadcrumbs.publications',
        id: 'publications',
        type: null
      }
    ]);
  }

  search = '';
  channel = 'all';
  topic = 'all';
  status = 'all';
  sort = 'newest';

  readonly Action = Action;

  pagination: Pagination = {
    pageSize: 20,
    pageNumber: 1,
    totalItemsCount: 0,
    totalPages: 0,
    totalItems: 0
  };
  loading = true;
  data: Publication[] = [];
  topics: any[] = [];
  channels: any[] = [];
  totalItemsCount = signal(-1);

  fetchPublications = (params?: any) =>
    this._apiService.post('studio/publications/list', params);

  edit(pub: any) {
    this._router.navigateByUrl(`/studio/publications/edit/${pub.hash}/content`);
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

    this.fetchPublications(params).subscribe((res: any) => {
      if (this.totalItemsCount() === -1) {
        this.totalItemsCount.set(res.total);
      }

      this.data = res.data;
      this.topics = res.topics;
      this.channels = res.channels;
      this.pagination.totalItems = res.total;
      this.pagination.totalPages = Math.ceil(res.total / this.pagination.pageSize);
      this.loading = false;

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

  createPublication(): void {
    this._apiService
      .post('studio/publication/new')
      .subscribe((res: any) => {
        this._router.navigateByUrl(`/studio/publications/edit/${res.publication.hash}/content`);
      })
    ;
  }

  delete(publication: Publication): void {
    const confirmDef = this._confirmManager.open({
      title: 'Force delete publication',
      description: 'Are you sure you want to delete this publication? Force deletion is not reversible, and the publication will be completely deleted.'
    });
    confirmDef.confirmed.subscribe(() => {
      this._apiService
        .delete(`studio/publications/${publication.hash}`)
        .subscribe(res => {
          this.loadData();
          this.totalItemsCount.update(value => value - 1);
          this._snackBar.open('Deleted!', 'OK', {
            duration: 3000
          });
        });
    });
  }

  unpublish(publication: Publication): void {
    const confirmDef = this._confirmManager.open({
      title: 'Unpublish publication',
      description: 'Are you sure you want to unpublish this publication?'
    });
    confirmDef.confirmed.subscribe(() => {
      this._apiService
        .post(`studio/publications/${publication.hash}/unpublish`)
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
}
