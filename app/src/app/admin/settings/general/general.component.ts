import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { AppStore } from '@store/app.store';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslateService } from '@services/translate.service';
import { TextareaAutoSize } from '@ngstarter-ui/components/core';

interface GeneralSettings {
  siteTitle: string;
  siteName: string;
  metaDescription: string;
  copyright: string;
  registrationEnabled: boolean;
  siteLogoUrl: string;
  siteIconUrl: string;
}

@Component({
  standalone: true,
  imports: [
    Button,
    FormField,
    ReactiveFormsModule,
    Input,
    Label,
    Hint,
    Panel,
    PanelHeader,
    PanelContent,
    ScrollbarArea,
    TranslocoPipe,
    TextareaAutoSize
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class GeneralComponent implements OnInit {
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _translateService = inject(TranslateService);

  form = this._formBuilder.group({
    siteTitle: ['', Validators.required],
    siteName: ['', Validators.required],
    metaDescription: [''],
    copyright: [''],
  });
  formActive = false;
  settings: GeneralSettings;

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
        id: 'general-settings',
        name: 'breadcrumbs.settings.general-settings',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api.get('admin/settings/general').subscribe((res: any) => {
      this.settings = res.settings;
      this._setInitialFormValue();
      this.loaded.set(true);
    });
  }

  edit(): void {
    this.formActive = true;
  }

  cancel(): void {
    this.formActive = false;
    this._setInitialFormValue();
  }

  save(): void {
    const value = this.form.value as GeneralSettings;
    this.settings = {...this.settings, ...value};
    this._api.post('admin/settings/general', value).subscribe(() => {
      this._snackBar.open(this._translateService.instant('admin.settings.general.saved'), '', { duration: 3000 });
    });
    this.formActive = false;
  }

  private _setInitialFormValue(): void {
    this.form.setValue({
      siteTitle: this.settings.siteTitle,
      siteName: this.settings.siteName,
      metaDescription: this.settings.metaDescription,
      copyright: this.settings.copyright,
    });
  }
}
