import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import {  Button } from '@ngstarter/components/button';
import { Error, FormField, Hint, Label, Suffix } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter/components/upload';
import { AppStore } from '@store/app.store';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { channelUniqueSlugValidator, slugValidator } from '@/@validators';
import { Channel, ChannelRule, User } from '@model/interfaces';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelTitle
} from '@ngstarter/components/expansion';
import { Dialog } from '@ngstarter/components/dialog';
import { NewComponent as NewRuleComponent } from '../_rule/new/new.component';
import { EditComponent as EditRuleComponent } from '../_rule/edit/edit.component';
import { Icon } from '@ngstarter/components/icon';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TextareaAutoSize } from '@ngstarter/components/core';
import { UserSelectModal } from '../_modals/user-select/user-select.modal';
import { Select, Option } from '@ngstarter/components/select';
import { Dicebear } from '@ngstarter/components/avatar';
import { OnInit, signal } from '@angular/core';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  imports: [
    FormsModule,
    ImageProxyPipe,
    Button,
    Error,
    FormField,
    Hint,
    Input,
    Label,
    ReactiveFormsModule,
    UploadTriggerDirective,
    RouterLink,
    ExpansionPanelTitle,
    ExpansionPanelHeader,
    ExpansionPanel,
    Accordion,
    Icon,
    PanelContent,
    Panel,
    PanelHeader,
    TextareaAutoSize,
    Select,
    Option,
    Dicebear,
    TranslocoModule,
  ],
  templateUrl: './new.component.html',
  styleUrl: './new.component.scss'
})
export class NewComponent implements OnInit {
  private _appStore = inject(AppStore);
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _dialog = inject(Dialog);

  form = this._formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
    slug: [
      '',
      [Validators.required, slugValidator()],
      channelUniqueSlugValidator(this._api, null)
    ],
    logoUrl: [''],
    logoId: [''],
    visibilityId: ['', [Validators.required]],
    accessType: [null as string | null, [Validators.required]],
    price: [0, [Validators.min(0)]],
    moderatorIds: [[] as string[]],
    ownerId: ['', [Validators.required]],
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
  private _translate = inject(TranslocoService);

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
        name: this._translate.translate('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'channels',
        name: this._translate.translate('breadcrumbs.channels'),
        route: '/admin/channels',
        type: 'link'
      },
      {
        id: 'newChannel',
        name: this._translate.translate('breadcrumbs.channels.new'),
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api.get('studio/channels/visibilities').subscribe((res: any) => {
      this.visibilities.set(res.visibilities || []);
      const publicVisibility = this.visibilities().find((v: any) => v.type === 'public');
      if (publicVisibility) {
        this.form.get('visibilityId')?.setValue(publicVisibility.id);
      } else if (this.visibilities().length > 0) {
        this.form.get('visibilityId')?.setValue(this.visibilities()[0].id);
      }
      this._checkAccessTypeStatus();
      this.loaded.set(true);
    });

    this.form.get('visibilityId')?.valueChanges.subscribe(() => {
      this._checkAccessTypeStatus();
    });
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


  isPublicVisibility(): boolean {
    const visibilityId = this.form.get('visibilityId')?.value;
    return this.visibilities()?.find((v) => v.id === visibilityId)?.type === 'public' || false;
  }

  save(): void {
    this.saving = true;
    this._api
      .post(`admin/channels/create`, this.form.value)
      .subscribe({
        next: (res: any) => {
          this.saving = false;
          this._snackBar.open(this._translate.translate('admin.channels.edit.created'), '', {
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
      minHeight: '800px',
      height: '800px',
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
      minHeight: '800px',
      height: '800px',
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
