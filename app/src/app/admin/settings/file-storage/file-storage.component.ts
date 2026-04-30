import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Dialog } from '@ngstarter/components/dialog';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { Button } from '@ngstarter/components/button';
import { Alert } from '@ngstarter/components/alert';
import {
  IntegrationSettingsComponent
} from '@/admin/settings/_modals/integration-settings/integration-settings.component';
import {
  AwsFileStorageProviderDialog
} from '@/admin/settings/_file-storage-provider/aws-file-storage-provider/aws-file-storage-provider.dialog';
import {
  HetznerFileStorageProviderDialog
} from '@/admin/settings/_file-storage-provider/hetzner-file-storage-provider/hetzner-file-storage-provider.dialog';
import {
  DigitaloceanFileStorageProviderDialog
} from '@/admin/settings/_file-storage-provider/digitalocean-file-storage-provider/digitalocean-file-storage-provider.dialog';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card, CardActions, CardContent, CardTitle } from '@ngstarter/components/card';
import { Icon } from '@ngstarter/components/icon';
import { TranslateService } from '@services/translate.service';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { Divider } from '@ngstarter/components/divider';

@Component({
  imports: [
    ReactiveFormsModule,
    Button,
    Alert,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe,
    CardContent,
    CardActions,
    Button,
    CardTitle,
    Card,
    Icon,
    FormField,
    Label,
    Input,
    Divider,
  ],
  templateUrl: './file-storage.component.html',
  styleUrl: './file-storage.component.scss'
})
export class FileStorageComponent implements OnInit {
  private _api = inject(ApiService);
  private dialog = inject(Dialog);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _translateService = inject(TranslateService);

  fileStorageProviders = signal<any[]>([]);
  loaded = signal(false);
  settingsSaving = signal(false);

  form = new FormGroup({
    maxUploadImageSize: new FormControl<number>(0),
    maxUploadVideoSize: new FormControl<number>(0),
    maxSizeForTranscoding: new FormControl<number>(0),
    maxDurationForTranscoding: new FormControl<number>(0),
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
        id: 'fileStorage',
        name: 'breadcrumbs.settings.fileStorage',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/file-storage')
      .subscribe((res: any) => {
        this.fileStorageProviders.set(res.fileStorageProviders || []);
        if (res.settings) {
          this.form.patchValue({
            maxUploadImageSize: res.settings.maxUploadImageSize,
            maxUploadVideoSize: res.settings.maxUploadVideoSize,
            maxSizeForTranscoding: res.settings.maxSizeForTranscoding,
            maxDurationForTranscoding: res.settings.maxDurationForTranscoding,
          });
        }
        this.loaded.set(true);
      });
  }

  isDefault(type: string): boolean {
    const provider = this.fileStorageProviders().find((p) => p.type === type);
    return !!provider?.isDefault;
  }

  hasDefault(): boolean {
    return this.fileStorageProviders().some((p) => !!p.isDefault);
  }

  setDefaultProvider(provider: any) {
    this._api.post('admin/settings/file-storage/provider/set-default', {type: provider.type}).subscribe({
      next: () => {
        // update local state
        const updated = this.fileStorageProviders().map((p) => ({...p, isDefault: p.type === provider.type}));
        this.fileStorageProviders.set(updated);
        this._snackBar.open(this._translateService.instant('admin.settings.fileStorage.defaultUpdated'), '', {
          verticalPosition: 'top',
          duration: 2000
        });
      },
      error: () => {
        this._snackBar.open(this._translateService.instant('admin.settings.fileStorage.defaultUpdateFailed'), '', {
          verticalPosition: 'top',
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

    // Local storage has no settings
    if (provider?.type === 'local') {
      return;
    }

    let dialogComponent: any = null;
    switch (provider.type) {
      case 'aws-s3':
        dialogComponent = AwsFileStorageProviderDialog;
        break;
      case 'digitalocean':
        dialogComponent = DigitaloceanFileStorageProviderDialog;
        break;
      case 'hetzner':
        dialogComponent = HetznerFileStorageProviderDialog;
        break;
    }

    if (!dialogComponent) {
      // Fallback to generic integration modal if specific dialog not implemented
      const ref = this.dialog.open(IntegrationSettingsComponent, {data: {integration: provider}});
      ref.afterClosed().subscribe((res) => {
        if (res) {
          provider.isConfigured = true;
          provider.settings = res;
          this._snackBar.open(this._translateService.instant('admin.settings.fileStorage.saved'), '', {
            verticalPosition: 'top',
            duration: 2000
          });
        }
      });
      return;
    }

    const modalRef = this.dialog.open(dialogComponent, {
      width: '600px',
      maxWidth: '600px',
      data: provider,
    });
    modalRef.afterClosed().subscribe((result) => {
      if (result) {
        provider.isConfigured = true;
        provider.isEnabled = result.isEnabled;
        provider.accessKeyId = result.accessKeyId;
        provider.secretAccessKey = result.secretAccessKey;
        provider.bucket = result.bucket;
        provider.region = result.region;
        provider.useAcl = result.useAcl;
        provider.cdnEnabled = result.cdnEnabled;

        if (result.isDefault !== undefined) {
          provider.isDefault = result.isDefault;
        }
      }
    });
  }

  saveSettings() {
    this.settingsSaving.set(true);
    this._api.post('admin/settings/file-storage/settings', this.form.value).subscribe({
      next: () => {
        this.settingsSaving.set(false);
        this._snackBar.open(this._translateService.instant('admin.settings.fileStorage.saved'), '', {
          verticalPosition: 'top',
          duration: 2000
        });
      },
      error: () => {
        this.settingsSaving.set(false);
        this._snackBar.open(this._translateService.instant('common.error'), '', {
          verticalPosition: 'top',
          duration: 3000
        });
      }
    });
  }
}
