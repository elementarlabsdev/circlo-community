import { Component, computed, forwardRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { LayoutContent, Layout, LayoutHeader } from '@ngstarter/components/layout';
import { Button } from '@ngstarter/components/button';
import { ReactiveFormsModule } from '@angular/forms';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { PanelContent, Panel, PanelSidebar } from '@ngstarter/components/panel';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip } from '@ngstarter/components/tooltip';
import { Navigation, NavigationItem } from '@ngstarter/components/navigation';
import { ApiService } from '@services/api.service';
import { TUTORIAL_EDIT_ROOT } from '@/studio/tutorials/types';
import { TutorialInterface } from '@model/interfaces';
import { Chip } from '@ngstarter/components/chips';

@Component({
  imports: [
    RouterOutlet,
    LayoutContent,
    Layout,
    LayoutHeader,
    Icon,
    Tooltip,
    ReactiveFormsModule,
    RouterLink,
    TimeAgoPipe,
    TranslocoPipe,
    Panel,
    PanelContent,
    PanelSidebar,
    Navigation,
    NavigationItem,
    Button,
    Chip
  ],
  providers: [
    {
      provide: TUTORIAL_EDIT_ROOT,
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
  readonly tutorial = signal<TutorialInterface | any>(null);
  readonly saving = signal<any>(false);
  readonly tutorialId = computed(() => {
    return this.activatedRoute.snapshot.params['id'];
  });

  constructor() {
    this.navItems.set([
      {
        key: 'overview',
        name: 'Overview',
        route: ['/studio/tutorials', this.tutorialId(), 'overview']
      },
      {
        key: 'content',
        name: 'Content',
        route: ['/studio/tutorials', this.tutorialId(), 'content']
      },
      {
        key: 'settings',
        name: 'Settings',
        route: ['/studio/tutorials', this.tutorialId(), 'settings']
      },
      {
        key: 'analytics',
        name: 'Analytics',
        route: ['/studio/tutorials', this.tutorialId(), 'analytics']
      },
      {
        key: 'publish',
        name: 'Publish',
        route: ['/studio/tutorials', this.tutorialId(), 'publish']
      },
    ]);
  }

  ngOnInit() {
    this.api
      .get(`studio/tutorials/${this.tutorialId()}/overview`)
      .subscribe((res: any) => {
        this.tutorial.set(res.tutorial);
        this.loading.set(false);
      });
  }
}
