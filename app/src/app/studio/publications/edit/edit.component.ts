import { Component, computed, forwardRef, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tooltip } from '@ngstarter/components/tooltip';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { LayoutContent, Layout, LayoutHeader } from '@ngstarter/components/layout';
import {
  PanelContent,
  Panel,
  PanelSidebar
} from '@ngstarter/components/panel';
import { Navigation, NavigationItem } from '@ngstarter/components/navigation';
import { PUBLICATION_EDIT_ROOT } from '@/studio/publications/types';
import { Alert } from '@ngstarter/components/alert';
import { Chip } from '@ngstarter/components/chips';

@Component({
  standalone: true,
  imports: [
    Icon,
    ReactiveFormsModule,
    TimeAgoPipe,
    RouterLink,
    Tooltip,
    TranslocoPipe,
    FormsModule,
    Layout,
    LayoutHeader,
    LayoutContent,
    Button,
    Panel,
    PanelContent,
    Navigation,
    NavigationItem,
    PanelSidebar,
    RouterOutlet,
    Alert,
    Button,
    Chip
  ],
  providers: [
    {
      provide: PUBLICATION_EDIT_ROOT,
      useExisting: forwardRef(() => EditComponent)
    }
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private api = inject(ApiService);

  readonly navItems = signal<any[]>([]);
  readonly loading = signal(true);
  readonly publication = signal<any>(null);
  readonly licenseTypes = signal<any[]>([]);
  readonly saving = signal<any>(false);
  readonly publicationHash = computed(() => {
    return this.activatedRoute.snapshot.params['hash'];
  });
  loaded = signal(false);

  constructor() {
    this.navItems.set([
      {
        key: 'overview',
        name: 'Overview',
        route: ['/studio/publications/edit', this.publicationHash(), 'overview']
      },
      {
        key: 'content',
        name: 'Content',
        route: ['/studio/publications/edit', this.publicationHash(), 'content']
      },
      {
        key: 'settings',
        name: 'Settings',
        route: ['/studio/publications/edit', this.publicationHash(), 'settings']
      },
      {
        key: 'publish',
        name: 'Publish',
        route: ['/studio/publications/edit', this.publicationHash(), 'publish']
      },
    ]);
  }

  ngOnInit() {
    this.api
      .get(`studio/publication/edit/${this.publicationHash()}`)
      .subscribe((res: any) => {
        this.publication.set(res.publication);
        this.licenseTypes.set(res.licenseTypes);
        this.loaded.set(true);
      });
  }
}
