import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoModule } from '@jsverse/transloco';
import { TranslateService } from '@services/translate.service';

interface StripeSettings {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeApplicationFeeAmount: number;
}

@Component({
  selector: 'app-stripe',
  standalone: true,
  imports: [
    Button,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoModule
  ],
  templateUrl: './stripe.html',
  styleUrl: './stripe.scss',
})
export class Stripe implements OnInit {
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _translate = inject(TranslateService);

  form = this._formBuilder.nonNullable.group({
    stripePublishableKey: ['', [Validators.required]],
    stripeSecretKey: ['', [Validators.required]],
    stripeWebhookSecret: [''],
    stripeApplicationFeeAmount: [10, [Validators.required, Validators.min(0), Validators.max(100)]],
  });
  formActive = false;
  settings: StripeSettings;

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
        id: 'admin',
        route: '/admin/settings',
        name: this._translate.instant('breadcrumbs.settings'),
        type: 'link'
      },
      {
        id: 'stripe',
        name: this._translate.instant('breadcrumbs.settings.stripe'),
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/stripe')
      .subscribe((res: any) => {
        this.settings = res;
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue() as StripeSettings;
    this._api
      .post('admin/settings/stripe', value)
      .subscribe(() => {
        this.settings = {...this.settings, ...value};
        this._snackBar.open(this._translate.instant('common.saved'), '', {
          duration: 3000
        });
        this.formActive = false;
      })
    ;
  }

  private _setInitialFormValue(): void {
    this.form.setValue({
      stripePublishableKey: this.settings.stripePublishableKey || '',
      stripeSecretKey: this.settings.stripeSecretKey || '',
      stripeWebhookSecret: this.settings.stripeWebhookSecret || '',
      stripeApplicationFeeAmount: this.settings.stripeApplicationFeeAmount ?? 10,
    });
  }
}
