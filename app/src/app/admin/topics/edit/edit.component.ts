import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Topic } from '@model/interfaces';
import { Button } from '@ngstarter-ui/components/button';
import { Error, FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { isPlatformBrowser } from '@angular/common';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { AppStore } from '@store/app.store';
import { slugValidator, topicUniqueSlugValidator } from '@/@validators';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslocoModule } from '@jsverse/transloco';
import { TextareaAutoSize } from '@ngstarter-ui/components/core';

@Component({
  standalone: true,
  imports: [
    Dicebear,
    Button,
    FormField,
    Hint,
    Input,
    Label,
    ReactiveFormsModule,
    UploadTriggerDirective,
    ImageProxyPipe,
    Error,

    RouterLink,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoModule,
    TextareaAutoSize
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private _appStore = inject(AppStore);
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _platformId = inject(PLATFORM_ID);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _translate = inject(TranslateService);

  form = this._formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
    slug: [
      '',
      [Validators.required, slugValidator()],
      topicUniqueSlugValidator(this._api, this._route.snapshot.params['id'])
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
        id: 'editTopic',
        name: this._translate.instant('breadcrumbs.topics.edit'),
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get(`admin/topics/${this._route.snapshot.params['id']}/edit`)
      .subscribe((res: any) => {
        if (isPlatformBrowser(this._platformId)) {
          this.topic = res.topic;
          this.form.setValue({
            name: res.topic.name,
            description: res.topic.description,
            slug: res.topic.slug,
            logoUrl: res.topic.logoUrl,
            logoId: res.topic.logoId,
            metaTitle: res.topic.metaTitle,
            metaDescription: res.topic.metaDescription,
          });
          this.loaded.set(true);
        }
      })
    ;
  }

  save(): void {
    this.saving = true;
    this._api
      .put(`admin/topics/${this.topic.id}`, this.form.value)
      .subscribe((res: any) => {
        this.saving = false;
        this._snackBar.open(this._translate.instant('admin.topics.edit.saved'), '', {
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
