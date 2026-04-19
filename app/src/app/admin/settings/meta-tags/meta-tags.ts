import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@services/translate.service';
import { Button } from '@ngstarter/components/button';
import { Input } from '@ngstarter/components/input';
import { Icon } from '@ngstarter/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { TranslocoPipe } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { FormField, Label } from '@ngstarter/components/form-field';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { AppStore } from '@store/app.store';
import { ActivatedRoute } from '@angular/router';
import { SnackBar } from '@ngstarter/components/snack-bar';

@Component({
  selector: 'app-meta-tags',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    Button,
    Input,
    Icon,
    Menu,
    MenuItem,
    MenuTrigger,
    Panel,
    PanelHeader,
    PanelContent,
    ScrollbarArea,
    FormField,
    Label
  ],
  templateUrl: './meta-tags.html',
  styleUrl: './meta-tags.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaTags implements OnInit {
  private readonly _api = inject(ApiService);
  private readonly _fb = inject(FormBuilder);
  private readonly _translate = inject(TranslateService);
  private readonly _appStore = inject(AppStore);
  private readonly _breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly _route = inject(ActivatedRoute);
  private readonly _snackBar = inject(SnackBar);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly form = this._fb.group({
    metaTags: this._fb.array([])
  });

  get metaTags() {
    return this.form.get('metaTags') as FormArray;
  }

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
        id: 'admin',
        route: '/admin',
        name: 'breadcrumbs.admin',
        type: 'link'
      },
      {
        id: 'admin',
        route: '/admin/settings',
        name: 'breadcrumbs.settings',
        type: 'link'
      },
      {
        id: 'meta-tags',
        name: 'breadcrumbs.settings.meta-tags',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this._api.get('admin/settings/meta-tags').subscribe({
      next: (tags: any) => {
        this.metaTags.clear();
        if (Array.isArray(tags)) {
          tags.forEach(tag => this.addTag(tag));
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  addTag(tag: any = { type: 'name', name: '', property: '', content: '' }) {
    this.metaTags.push(this._fb.group({
      type: [tag.type || 'name'],
      name: [tag.name || ''],
      property: [tag.property || ''],
      content: [tag.content || '', Validators.required]
    }));
  }

  removeTag(index: number) {
    this.metaTags.removeAt(index);
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    this._api.post('admin/settings/meta-tags', this.form.value).subscribe({
      next: () => {
        this.saving.set(false);
        this._snackBar.open(this._translate.instant('message.settings.meta-tags.saved'), '', { duration: 3000 });
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
