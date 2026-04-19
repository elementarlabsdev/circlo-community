import { Component, inject, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';
import { Checkbox } from '@ngstarter/components/checkbox';
import { Input } from '@ngstarter/components/input';
import { FormField, Label } from '@ngstarter/components/form-field';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslateService } from '@services/translate.service';

interface ContentSettings {
  contentAllowThreads: boolean;
  contentAllowPublications: boolean;
  contentAllowTutorials: boolean;
  contentAllowCourses: boolean;
  maxDraftPublicationsPerUser: number;
  maxDraftTutorialsPerUser: number;
  newDraftVersionCreationInterval: number;
}

@Component({
  standalone: true,
  imports: [
    Button,
    Checkbox,
    Input,
    FormField,
    Label,
    ReactiveFormsModule,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe
  ],
  templateUrl: './content.component.html',
})
export class ContentComponent {
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _translateService = inject(TranslateService);

  form = this._formBuilder.group({
    contentAllowThreads: [true],
    contentAllowPublications: [true],
    contentAllowTutorials: [true],
    contentAllowCourses: [true],
    maxDraftPublicationsPerUser: [5, [Validators.required, Validators.min(0)]],
    maxDraftTutorialsPerUser: [5, [Validators.required, Validators.min(0)]],
    newDraftVersionCreationInterval: [5, [Validators.required, Validators.min(1)]],
  });
  settings: ContentSettings;
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
        id: 'content',
        name: this._translateService.instant('breadcrumbs.settings.content'),
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/content')
      .subscribe((res: any) => {
        this.settings = res.settings;
        this._setInitialFormValue();
        this.loaded.set(true);
      })
    ;
  }

  save(): void {
    this._api
      .post('admin/settings/content', this.form.value)
      .subscribe(() => {
        this._snackBar.open(this._translateService.instant('admin.settings.content.saved'), '', {
          duration: 3000
        });
      })
    ;
  }

  private _setInitialFormValue(): void {
    this.form.patchValue({
      contentAllowThreads: this.settings.contentAllowThreads,
      contentAllowPublications: this.settings.contentAllowPublications,
      contentAllowTutorials: this.settings.contentAllowTutorials,
      contentAllowCourses: this.settings.contentAllowCourses,
      maxDraftPublicationsPerUser: this.settings.maxDraftPublicationsPerUser,
      maxDraftTutorialsPerUser: this.settings.maxDraftTutorialsPerUser,
      newDraftVersionCreationInterval: this.settings.newDraftVersionCreationInterval,
    });
  }
}
