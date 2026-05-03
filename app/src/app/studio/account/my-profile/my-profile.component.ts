import { Component, inject, OnInit } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ApiService } from '@services/api.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MyProfile } from '@model/interfaces';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { usernameValidator } from '@/@validators/username.validator';
import { uniqueUsernameValidator } from '@/@validators/unique-username.validator';
import { AppStore } from '@store/app.store';
import { TranslocoPipe } from '@jsverse/transloco';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { TextareaAutoSize } from '@ngstarter-ui/components/core';

@Component({
  standalone: true,
  imports: [
    Button,
    Dicebear,
    FormField,
    Label,
    ReactiveFormsModule,
    Input,
    UploadTriggerDirective,
    ImageProxyPipe,
    Error,
    TranslocoPipe,
    Panel,
    PanelContent,
    PanelHeader,
    ScrollbarArea,
    TextareaAutoSize
  ],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent implements OnInit {
  private _api = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _appStore = inject(AppStore);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);

  myProfile: MyProfile;
  loaded = false;
  form = this._formBuilder.group({
    avatarUrl: [''],
    username: [
      '',
      [Validators.required, usernameValidator()],
      uniqueUsernameValidator(this._api, (this._appStore.profile() as any).id)
    ],
    name: ['', Validators.required],
    jobTitle: [''],
    bio: [''],
    location: [''],
  });

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
        id: 'studio',
        name: 'breadcrumbs.studio',
        route: '/studio',
        type: 'link',
      },
      {
        name: 'breadcrumbs.account',
        id: 'account',
        type: 'link',
        route: '/studio/account',
      },
      {
        name: 'breadcrumbs.account.myProfile',
        id: 'myProfile',
        type: null
      }
    ]);
  }

  get avatarUrl(): string {
    return this.form.get('avatarUrl')?.value || '';
  }

  ngOnInit() {
    this._api
      .get('studio/account/my-profile')
      .subscribe((profile: any) => {
        this.myProfile = profile;
        this.form.setValue({
          avatarUrl: profile.avatarUrl,
          username: profile.username,
          name: profile.name,
          jobTitle: profile.jobTitle,
          bio: profile.bio,
          location: profile.location,
        });
        this.loaded = true;
      })
    ;
  }

  save(): void {
    this.myProfile = this.form.value as MyProfile;
    this._api
      .post('studio/account/my-profile', this.form.value)
      .subscribe((res: any) => {
        this._snackBar.open('Saved', '', {
          duration: 3000
        });
      })
    ;
  }

  avatarSelected(event: UploadFileSelectedEvent): void {
    const formData = new FormData();
    formData.append('image', event.files[0]);
    this._api
      .post(`studio/account/my-profile/avatar/upload`, formData)
      .subscribe((res: any) => {
        this.form.get('avatarUrl')?.setValue(res.url);
      })
    ;
  }

  deleteAvatar(): void {
    this.form.get('avatarUrl')?.setValue('');
    this.myProfile.avatarUrl = '';
  }
}
