import { Component, inject, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { Option, Select } from '@ngstarter/components/select';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { TranslateService } from '@services/translate.service';

interface ReadingSettings {
  publicationsPerPage: number;
  publicationsShowOnFront: string;
  topicsPerPage: number;
  channelsPerPage: number;
  feedType: 'standard' | 'smart';
}

@Component({
  standalone: true,
  imports: [
    Button,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    Select,
    Option,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe
  ],
  templateUrl: './reading.component.html',
  styleUrl: './reading.component.scss'
})
export class ReadingComponent {
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _translateService = inject(TranslateService);
  private _translocoService = inject(TranslocoService);

  form = this._formBuilder.group({
    publicationsPerPage: [20, Validators.required],
    topicsPerPage: [32, Validators.required],
    channelsPerPage: [32, Validators.required],
    publicationsShowOnFront: ['latest', Validators.required],
    feedType: ['standard', Validators.required],
  });
  formActive = false;
  settings: ReadingSettings;
  publicationsShowOnFrontOptions = [
    {
      name: 'admin.settings.reading.latestPosts',
      value: 'latest'
    }
  ];
  feedTypeOptions = [
    {
      name: 'admin.settings.reading.feedTypeStandard',
      value: 'standard'
    },
    {
      name: 'admin.settings.reading.feedTypeSmart',
      value: 'smart'
    }
  ];
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
        id: 'admin',
        route: '/admin',
        name: this._translateService.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'admin',
        route: '/admin/settings',
        name: this._translateService.instant('breadcrumbs.settings'),
        type: 'link'
      },
      {
        id: 'reading',
        name: this._translateService.instant('breadcrumbs.settings.reading'),
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/reading')
      .subscribe((res: any) => {
        this.settings = res.settings;
        this._setInitialFormValue();
        this.loaded.set(true);
      })
    ;
  }

  edit(): void {
    this.formActive = true;
  }

  cancel(): void {
    this.formActive = false;
    this._setInitialFormValue();
  }

  save(): void {
    const value = this.form.value as ReadingSettings;
    this.settings = {...this.settings, ...value};
    this._api
      .post('admin/settings/reading', this.form.value)
      .subscribe((res: any) => {
        this._snackBar.open(this._translateService.instant('admin.settings.reading.saved'), '', {
          duration: 3000
        });
      })
    ;
    this.formActive = false;
  }

  private _setInitialFormValue(): void {
    this.form.setValue({
      publicationsPerPage: this.settings.publicationsPerPage,
      publicationsShowOnFront: this.settings.publicationsShowOnFront,
      topicsPerPage: this.settings.topicsPerPage,
      channelsPerPage: this.settings.channelsPerPage,
      feedType: this.settings.feedType
    });
  }
}
