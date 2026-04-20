import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Input } from '@ngstarter/components/input';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter/components/upload';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelTitle
} from '@ngstarter/components/expansion';
import { AppStore } from '@store/app.store';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Dialog } from '@ngstarter/components/dialog';
import { channelUniqueSlugValidator, slugValidator } from '@/@validators';
import { Channel, ChannelRule, User } from '@model/interfaces';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslocoModule } from '@jsverse/transloco';
import { EditComponent as EditRuleComponent } from '@/admin/channels/_rule/edit/edit.component';
import { NewComponent as NewRuleComponent } from '@/admin/channels/_rule/new/new.component';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Error, FormField, Hint, Label } from '@ngstarter/components/form-field';
import { TranslateService } from '@services/translate.service';
import { TextareaAutoSize } from '@ngstarter/components/core';
import { Dicebear } from '@ngstarter/components/avatar';
import { UserSelectModal } from '../_modals/user-select/user-select.modal';
import { Select, Option } from '@ngstarter/components/select';

@Component({
  selector: 'app-edit',
  imports: [
    ImageProxyPipe,
    Accordion,
    Button,
    Error,
    ExpansionPanel,
    ExpansionPanelHeader,
    ExpansionPanelTitle,
    FormField,
    Hint,
    Icon,
    Input,
    Label,
    ReactiveFormsModule,
    RouterLink,
    UploadTriggerDirective,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoModule,
    TextareaAutoSize,
    Dicebear,
    Select,
    Option,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private _appStore = inject(AppStore);
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _dialog = inject(Dialog);
  private _translate = inject(TranslateService);

  form = this._formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
    slug: [
      '',
      [Validators.required, slugValidator()],
      channelUniqueSlugValidator(this._api, this._route.snapshot.params['id'] || null)
    ],
    logoUrl: [''],
    logoId: [''],
    visibilityId: ['', [Validators.required]],
    accessType: [null as string | null, [Validators.required]],
    moderatorIds: [[] as string[]],
    ownerId: [''],
    rules: [[]],
    metaTitle: [''],
    metaDescription: [''],
  });
  loading = true;
  saving = false;
  channel: Channel;
  siteUrl = this._appStore.hostUrl();
  loaded = signal(false);
  visibilities = signal<any[]>([]);

  accessTypes = signal([
    { type: 'subscribers', name: 'admin.channels.edit.accessTypeSubscribers' },
  ]);

  get rules(): ChannelRule[] {
    return this.form.value.rules as unknown as ChannelRule[];
  }

  selectedModerators: User[] = [];
  selectedOwner: User | null = null;

  private _breadcrumbsStore = inject(BreadcrumbsStore);

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
        id: 'channels',
        name: this._translate.instant('breadcrumbs.channels'),
        route: '/admin/channels',
        type: 'link'
      },
      {
        id: 'editChannel',
        name: this._translate.instant('breadcrumbs.channels.edit'),
        type: null
      }
    ]);
  }

  ngOnInit() {
    forkJoin({
      visibilities: this._api.get('studio/channels/visibilities'),
      channel: this._api.get(`admin/channels/${this._route.snapshot.params['id']}`)
    }).subscribe((res: any) => {
      this.visibilities.set(res.visibilities.visibilities || []);

      const channel = res.channel.channel;
      this.selectedModerators = channel.moderators ?? [];
      this.selectedOwner = channel.owner ?? null;

      this.form.patchValue({
        name: channel.name,
        description: channel.description,
        slug: channel.slug,
        logoUrl: channel.logoUrl,
        logoId: channel.logoId,
        metaTitle: channel.metaTitle,
        metaDescription: channel.metaDescription,
        visibilityId: channel.visibilityId,
        accessType: channel.accessType,
        moderatorIds: channel.moderators?.map((m: any) => m.id) ?? [],
        ownerId: channel.ownerId,
        rules: channel.rules.map((rule: any) => {
          return {
            id: rule.id,
            name: rule.name,
            description: rule.description,
          }
        })
      });

      this._checkAccessTypeStatus();
      this.loaded.set(true);
    });

    this.form.get('visibilityId')?.valueChanges.subscribe(() => {
      this._checkAccessTypeStatus();
    });
  }

  isPublicVisibility(): boolean {
    const visibilityId = this.form.get('visibilityId')?.value;
    return this.visibilities()?.find((v) => v.id === visibilityId)?.type === 'public' || false;
  }

  private _checkAccessTypeStatus() {
    if (this.visibilities().length === 0) {
      return;
    }
    const visibilityId = this.form.get('visibilityId')?.value;
    const visibility = this.visibilities()?.find((v) => v.id === visibilityId);
    const accessTypeControl = this.form.get('accessType');

    if (visibility?.type === 'public') {
      accessTypeControl?.setValue(null);
      accessTypeControl?.disable();
    } else if (visibility?.type === 'private') {
      accessTypeControl?.enable();
      if (!accessTypeControl?.value) {
        accessTypeControl?.setValue('subscribers');
      }
    }
  }


  save(): void {
    this.saving = true;
    this._api
      .put(`admin/channels/${this._route.snapshot.params['id']}`, this.form.value)
      .subscribe({
        next: (res: any) => {
          this.saving = false;
          this._snackBar.open(this._translate.translate('admin.channels.edit.saved'), '', {
            duration: 3000
          });
          this._router.navigateByUrl('/admin/channels');
        },
        error: () => {
          this._snackBar.open(this._translate.translate('admin.channels.edit.saveError'), '', {
            duration: 3000
          });
          this.saving = false;
        }
      });
  }

  onLogoSelect(event: UploadFileSelectedEvent): void {
    const formData = new FormData();
    formData.append('image', event.files[0]);
    this._api
      .post(`admin/channels/logo/upload`, formData)
      .subscribe((res: any) => {
        const logoUrl = res.file.url;
        this.form.get('logoUrl')?.setValue(logoUrl);
        this.form.get('logoId')?.setValue(res.file.id);
      })
    ;
  }

  deleteLogo(): void {
    this.form.get('logoUrl')?.setValue('');
    this.form.get('logoId')?.setValue('');
  }

  editRule(event: Event, rule: ChannelRule, index: number) {
    event.preventDefault();
    event.stopPropagation();
    const dialogRef = this._dialog.open(EditRuleComponent, {
      data: rule,
      width: '600px',
      maxWidth: '600px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const rules = this.form.value.rules as unknown as ChannelRule[];
        rules[index] = result;
        // @ts-ignore
        this.form.get('rules')?.setValue(rules);
      }
    });
  }

  deleteRule(event: Event, index: number) {
    event.preventDefault();
    event.stopPropagation();
    const rules = this.form.value.rules as unknown as ChannelRule[];
    rules.splice(index, 1);
    // @ts-ignore
    this.form.get('rules')?.setValue(rules);
  }

  addRule() {
    const dialogRef = this._dialog.open(NewRuleComponent, {
      width: '600px',
      maxWidth: '600px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const rules = this.form.value.rules as unknown as ChannelRule[];
        rules.push(result);
        // @ts-ignore
        this.form.get('rules')?.setValue(rules);
      }
    });
  }

  selectModerators() {
    const dialogRef = this._dialog.open(UserSelectModal, {
      width: '800px',
      maxWidth: '800px',
      minHeight: '75vh',
      data: {
        selectedUsers: this.selectedModerators
      }
    });
    dialogRef.afterClosed().subscribe((result: User[]) => {
      if (result) {
        this.selectedModerators = result;
        this.form.get('moderatorIds')?.setValue(result.map(u => u.id));
      }
    });
  }

  removeModerator(user: User) {
    this.selectedModerators = this.selectedModerators.filter(u => u.id !== user.id);
    this.form.get('moderatorIds')?.setValue(this.selectedModerators.map(u => u.id));
  }

  selectOwner() {
    const dialogRef = this._dialog.open(UserSelectModal, {
      width: '800px',
      maxWidth: '800px',
      minHeight: '75vh',
      data: {
        selectedUsers: this.selectedOwner ? [this.selectedOwner] : [],
        multiple: false,
        title: 'admin.channels.selectOwner'
      }
    });
    dialogRef.afterClosed().subscribe((result: User[]) => {
      if (result && result.length > 0) {
        this.selectedOwner = result[0];
        this.form.get('ownerId')?.setValue(result[0].id);
      }
    });
  }
}
