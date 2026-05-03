import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { ResendMailProviderDialog } from '../_mail-provider/resend-mail-provider/resend-mail-provider.dialog';
import { MailchimpMailProviderDialog } from '../_mail-provider/mailchimp-mail-provider/mailchimp-mail-provider.dialog';
import {
  AmazonSesMailProviderDialog
} from '../_mail-provider/amazon-ses-mail-provider/amazon-ses-mail-provider.dialog';
import { SendgridMailProviderDialog } from '../_mail-provider/sendgrid-mail-provider/sendgrid-mail-provider.dialog';
import { MandrillMailProviderDialog } from '../_mail-provider/mandrill-mail-provider/mandrill-mail-provider.dialog';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { Alert } from '@ngstarter-ui/components/alert';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { Card, CardActions, CardContent, CardTitle } from '@ngstarter-ui/components/card';
import { Icon } from '@ngstarter-ui/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslateService } from '@services/translate.service';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Divider } from '@ngstarter-ui/components/divider';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [
    FormsModule,
    Button,
    ReactiveFormsModule,
    Alert,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    Card,
    CardTitle,
    CardContent,
    CardActions,
    Icon,
    TranslocoPipe,
    FormField,
    Label,
    Input,
    Hint,
    Divider
  ],
  templateUrl: './mail.component.html',
  styleUrl: './mail.component.scss'
})
export class MailComponent implements OnInit {
  private _api = inject(ApiService);
  private _snackBar = inject(SnackBar);
  private _dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _translateService = inject(TranslateService);
  private _formBuilder = inject(FormBuilder);

  form = this._formBuilder.group({
    mailDomain: ['', Validators.required],
    mailFrom: ['', Validators.required],
    systemEmail: ['', Validators.required],
    supportEmail: ['', Validators.required],
  });

  mailProviders = signal<any[]>([]);
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
        id: 'mail-settings',
        name: 'breadcrumbs.settings.mail',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/mail-providers')
      .subscribe((res: any) => {
        this.mailProviders.set(res.mailProviders);
      });

    this._api.get('admin/settings/mail').subscribe((res: any) => {
      this.form.patchValue(res.settings);
      this.loaded.set(true);
    });
  }

  save() {
    this._api.post('admin/settings/mail', this.form.value).subscribe(() => {
      this._snackBar.open(this._translateService.instant('admin.settings.mail.saved'), '', {duration: 3000});
    });
  }

  isDefault(type: string): boolean {
    const provider = this.mailProviders().find((p) => p.type === type);
    return provider.isDefault;
  }

  hasDefault(): boolean {
    return this.mailProviders().some((p) => !!p.isDefault);
  }

  setDefaultProvider(provider: any) {
    if (provider?.isEnabled === false) {
      return;
    }

    this._api.post('admin/settings/mail-providers/provider/set-default', {type: provider.type}).subscribe({
      next: () => {
        const updated = this.mailProviders().map((p) => ({...p, isDefault: p.type === provider.type}));
        this.mailProviders.set(updated);
        this._snackBar.open(this._translateService.instant('admin.settings.mail.defaultUpdated'), '', {
          duration: 2000
        });
      },
      error: () => {
        this._snackBar.open(this._translateService.instant('admin.settings.mail.defaultUpdateFailed'), '', {
          duration: 3000
        });
      }
    });
  }

  configure(provider: any, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    let dialogComponent: any = null;
    switch (provider.type) {
      case 'resend':
        dialogComponent = ResendMailProviderDialog;
        break;
      case 'mailchimp':
        dialogComponent = MailchimpMailProviderDialog;
        break;
      case 'aws-ses':
        dialogComponent = AmazonSesMailProviderDialog;
        break;
      case 'sendgrid':
        dialogComponent = SendgridMailProviderDialog;
        break;
      case 'mandrill':
        dialogComponent = MandrillMailProviderDialog;
        break;
      default:
        dialogComponent = null;
    }

    if (!dialogComponent) {
      return;
    }

    const dialogRef = this._dialog.open(dialogComponent, {data: provider, width: '500px'});
    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          const {isEnabled, isDefault, ...config} = result;
          const updated = this.mailProviders().map((p) => {
            if (p.type === provider.type) {
              return {
                ...p,
                isConfigured: true,
                isEnabled: isEnabled,
                config: config,
                ...(isDefault !== undefined ? {isDefault: isDefault} : {})
              };
            }

            // If the edited provider became default, we should reset isDefault for others
            if (isDefault === true) {
              return {...p, isDefault: false};
            }

            return p;
          });
          this.mailProviders.set(updated);
        }
      });
  }
}
