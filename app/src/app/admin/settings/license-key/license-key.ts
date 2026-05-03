import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from '@services/api.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslateService } from '@services/translate.service';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';

@Component({
  imports: [
    Button,
    FormField,
    ReactiveFormsModule,
    Input,
    Label,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
    Toolbar,
    ToolbarTitle,
    ToolbarSpacer,
  ],
  templateUrl: './license-key.html',
  styleUrl: './license-key.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicenseKey implements OnInit {
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _translateService = inject(TranslateService);

  form = this._formBuilder.group({
    licenseKey: ['', Validators.required],
  });
  formActive = signal(false);

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
        id: 'license-key',
        name: 'admin.settings.license-key',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api.get('admin/settings/license').subscribe((res: any) => {
      if (res.settings && res.settings.licenseKey) {
        this.form.patchValue({
          licenseKey: res.settings.licenseKey
        });
      }
      this.loaded.set(true);
    });
  }

  edit(): void {
    this.formActive.set(true);
  }

  cancel(): void {
    this.formActive.set(false);
    this.ngOnInit();
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.value;
    this._api.post('admin/settings/license', value).subscribe(() => {
      this._snackBar.open(this._translateService.instant('admin.settings.license-key.saved'), '', { duration: 3000 });
      this.formActive.set(false);
    });
  }
}
