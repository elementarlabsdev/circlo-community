import { Component, computed, forwardRef, inject, InjectionToken, signal } from '@angular/core';
import { LayoutContent, Layout, LayoutHeader } from '@ngstarter/components/layout';
import { Button } from '@ngstarter/components/button';
import { Navigation, NavigationItem } from '@ngstarter/components/navigation';
import { PanelContent, Panel, PanelSidebar } from '@ngstarter/components/panel';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { Tooltip } from '@ngstarter/components/tooltip';
import { Icon } from '@ngstarter/components/icon';
import { ApiService } from '@services/api.service';
import { AppStore } from '@store/app.store';
import { Chip } from '@ngstarter/components/chips';

export const ADMIN_PAGE_EDIT_ROOT = new InjectionToken('ADMIN_PAGE_EDIT_ROOT');

@Component({
  imports: [
    LayoutContent,
    Layout,
    LayoutHeader,
    Icon,
    Button,
    Navigation,
    NavigationItem,
    PanelContent,
    Panel,
    PanelSidebar,
    RouterLink,
    RouterOutlet,
    TimeAgoPipe,
    TranslocoPipe,
    Tooltip,
    Chip
  ],
  providers: [
    {
      provide: ADMIN_PAGE_EDIT_ROOT,
      useExisting: forwardRef(() => Edit)
    }
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.scss',
})
export class Edit {
  private appStore = inject(AppStore);
  private activatedRoute = inject(ActivatedRoute);
  private api = inject(ApiService);

  readonly navItems = signal<any[]>([]);
  readonly loading = signal(true);
  readonly page = signal<any>(null);
  readonly saving = signal<any>(false);
  readonly pageHash = computed(() => {
    return this.activatedRoute.snapshot.params['hash'];
  });
  readonly pageId = computed(() => {
    return this.page()?.id;
  });
  loaded = signal(false);

  constructor() {
    this.appStore.setBreadcrumbs([
      {
        name: 'Admin',
        link: '/admin'
      },
      {
        name: 'Pages',
        link: '/admin/pages'
      },
      {
        name: 'Edit Page'
      }
    ]);
    this.navItems.set([
      {
        key: 'overview',
        name: 'Overview',
        route: ['/admin/pages/edit', this.pageHash(), 'overview']
      },
      {
        key: 'content',
        name: 'Content',
        route: ['/admin/pages/edit', this.pageHash(), 'content']
      },
      {
        key: 'settings',
        name: 'Settings',
        route: ['/admin/pages/edit', this.pageHash(), 'settings']
      },
      {
        key: 'publish',
        name: 'Publish',
        route: ['/admin/pages/edit', this.pageHash(), 'publish']
      },
    ]);
  }

  ngOnInit() {
    this.api
      .get(`admin/pages/${this.pageHash()}`)
      .subscribe((res: any) => {
        this.page.set(res.page);
        this.loaded.set(true);
      });
  }
}
