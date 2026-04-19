import { Component, inject, signal } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Button } from '@ngstarter/components/button';
import { Select, Option } from '@ngstarter/components/select';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter/components/upload';
import { AppStore } from '@store/app.store';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { FormField, Label } from '@ngstarter/components/form-field';
import { TranslateService } from '@services/translate.service';

@Component({
  imports: [
    Icon,
    ImageProxyPipe,
    Button,
    FormField,
    Label,
    Option,
    Select,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    ReactiveFormsModule,
    TranslocoPipe,
    UploadTriggerDirective
  ],
  templateUrl: './branding.html',
  styleUrl: './branding.scss',
})
export class Branding {
  private _appStore = inject(AppStore);
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _translateService = inject(TranslateService);

  googleFonts = [
    { label: 'Inter', value: 'Inter' },
    { label: 'Roboto', value: 'Roboto' },
    { label: 'Open Sans', value: 'Open Sans' },
    { label: 'Lato', value: 'Lato' },
    { label: 'Montserrat', value: 'Montserrat' },
    { label: 'Poppins', value: 'Poppins' },
    { label: 'Nunito', value: 'Nunito' },
    { label: 'Work Sans', value: 'Work Sans' },
    { label: 'Oswald', value: 'Oswald' },
    { label: 'Raleway', value: 'Raleway' },
  ];
  form = this._formBuilder.group({
    fontFamily: ['', Validators.required],
    siteLogoUrl: [''],
    siteIconUrl: [''],
  });
  settings: any;
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
        id: 'branding',
        name: 'breadcrumbs.settings.branding',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/branding')
      .subscribe((res: any) => {
        const settings = res.settings;
        this.settings = settings;
        this.form.patchValue({
          fontFamily: settings.fontFamily,
          siteLogoUrl: settings.siteLogoUrl,
          siteIconUrl: settings.siteIconUrl,
        });
        this.loaded.set(true);
      });
  }

  save(): void {
    const value = this.form.value;
    this.settings = {...this.settings, ...value};
    this._api
      .post('admin/settings/branding', this.form.value)
      .subscribe((res: any) => {
        this._snackBar.open(this._translateService.instant('admin.settings.branding.saved'), '', {
          duration: 3000
        });
      });
  }

  logoSelected(event: UploadFileSelectedEvent): void {
    const formData = new FormData();
    formData.append('image', event.files[0]);
    this._api
      .post(`admin/settings/branding/logo/upload`, formData)
      .subscribe((res: any) => {
        this.settings.siteLogoUrl = res.url;
        this.form.get('siteLogoUrl')?.setValue(res.url);
      });
  }

  faviconSelected(event: UploadFileSelectedEvent): void {
    const formData = new FormData();
    formData.append('image', event.files[0]);
    this._api
      .post(`admin/settings/branding/favicon/upload`, formData)
      .subscribe((res: any) => {
        this.settings.siteIconUrl = res.url;
        this.form.get('siteIconUrl')?.setValue(res.url);
      });
  }

  removeSiteLogoUrl(): void {
    this.settings.siteLogoUrl = '';
    this.form.get('siteLogoUrl')?.setValue('');
  }

  removeSiteIconUrl(): void {
    this.settings.siteIconUrl = '';
    this.form.get('siteIconUrl')?.setValue('');
  }
}
