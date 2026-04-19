import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { FormField, Label, Error } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { TranslateService } from '@services/translate.service';

interface SecuritySettings {
  emailVerificationIntervalBetweenSendsTime: number;
  emailVerificationSentCount: number;
  emailVerificationBlockTime: number;
}

@Component({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Button,
    FormField,
    Input,
    Label,
    Error,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe,
  ],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss'
})
export class SecurityComponent {
  private _appStore = inject(AppStore);
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _translateService = inject(TranslateService);

  form = this._formBuilder.group({
    emailVerificationIntervalBetweenSendsTime: [0, [Validators.required, Validators.min(0)]],
    emailVerificationSentCount: [0, [Validators.required, Validators.min(0)]],
    emailVerificationBlockTime: [0, [Validators.required, Validators.min(0)]],
  });

  settings: SecuritySettings;
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
        id: 'settings',
        route: '/admin/settings',
        name: 'breadcrumbs.settings',
        type: 'link'
      },
      {
        id: 'security',
        name: 'breadcrumbs.settings.security',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/security')
      .subscribe((res: any) => {
        this.settings = res.settings;
        this.form.patchValue({
          emailVerificationIntervalBetweenSendsTime: this.settings.emailVerificationIntervalBetweenSendsTime,
          emailVerificationSentCount: this.settings.emailVerificationSentCount,
          emailVerificationBlockTime: this.settings.emailVerificationBlockTime,
        });
        this.loaded.set(true);
      });
  }

  save(): void {
    const value = this.form.value as SecuritySettings;
    this.settings = { ...this.settings, ...value };
    this._api
      .post('admin/settings/security', {
        emailVerificationIntervalBetweenSendsTime: this.form.value.emailVerificationIntervalBetweenSendsTime,
        emailVerificationSentCount: this.form.value.emailVerificationSentCount,
        emailVerificationBlockTime: this.form.value.emailVerificationBlockTime,
      })
      .subscribe(() => {
        this._snackBar.open(this._translateService.instant('admin.settings.security.saved'), '', {
          duration: 3000
        });
      });
  }
}
