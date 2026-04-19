import { Component, inject } from '@angular/core';
import { AppStore } from '@store/app.store';
import { ApiService } from '@services/api.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { slugValidator, topicUniqueSlugValidator } from '@/@validators';
import { Topic } from '@model/interfaces';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter/components/upload';
import {  Button } from '@ngstarter/components/button';
import { Dicebear } from '@ngstarter/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Input } from '@ngstarter/components/input';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Error, Hint } from '@ngstarter/components/form-field';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoModule } from '@jsverse/transloco';
import { TextareaAutoSize } from '@ngstarter/components/core';

@Component({
  imports: [
    FormsModule,
    Button,
    ReactiveFormsModule,
    Dicebear,
    ImageProxyPipe,
    Error,
    FormField,
    Hint,
    Input,
    Label,
    UploadTriggerDirective,
    RouterLink,

    PanelContent,
    Panel,
    PanelHeader,
    TranslocoModule,
    TextareaAutoSize,
  ],
  templateUrl: './new.component.html',
  styleUrl: './new.component.scss'
})
export class NewComponent {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _appStore = inject(AppStore);
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _translate = inject(TranslateService);

  form = this._formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
    slug: [
      '',
      [Validators.required, slugValidator()],
      topicUniqueSlugValidator(this._api)
    ],
    logoUrl: [''],
    logoId: [''],
    metaTitle: [''],
    metaDescription: [''],
  });
  loading = true;
  saving = false;
  topic: Topic;
  siteUrl = this._appStore.hostUrl();
  loaded = false;

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
        name: this._translate.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'topics',
        name: this._translate.instant('breadcrumbs.topics'),
        route: '/admin/topics',
        type: 'link'
      },
      {
        id: 'newTopic',
        name: this._translate.instant('breadcrumbs.topics.new'),
        type: null
      }
    ]);
  }

  save(): void {
    this.saving = true;
    this._api
      .post(`admin/topics`, this.form.value)
      .subscribe((res: any) => {
        this.saving = false;
        this._snackBar.open(this._translate.instant('common.saved'), '', {
          duration: 3000
        });
        this._router.navigateByUrl('/admin/topics');
      })
    ;
  }

  onLogoSelect(event: UploadFileSelectedEvent): void {
    const formData = new FormData();
    formData.append('image', event.files[0]);
    this._api
      .post(`admin/topics/logo/upload`, formData)
      .subscribe((res: any) => {
        const logoUrl = res.file.url;
        this.form.get('logoUrl')?.setValue(logoUrl);
        this.form.get('logoId')?.setValue(res.file.id);
        this.topic.logoUrl = logoUrl;
      })
    ;
  }

  deleteLogo(): void {
    this.form.get('logoUrl')?.setValue('');
    this.form.get('logoId')?.setValue('');
    this.topic.logoUrl = '';
  }
}
