import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label, Hint, Error } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Icon } from '@ngstarter-ui/components/icon';
import { Accordion, ExpansionPanel, ExpansionPanelHeader, ExpansionPanelTitle } from '@ngstarter-ui/components/expansion';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { AppStore } from '@store/app.store';
import { SubscriptionStore } from '@store/subscription.store';
import { ChannelRule, User } from '@model/interfaces';
import { StudioChannelsApi } from '../channels.api';
import { slugValidator, channelUniqueSlugValidator } from '@/@validators';
import { ApiService } from '@services/api.service';
import { NewComponent as NewRuleComponent } from '../../../admin/channels/_rule/new/new.component';
import { EditComponent as EditRuleComponent } from '../../../admin/channels/_rule/edit/edit.component';
import { TextareaAutoSize } from '@ngstarter-ui/components/core';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { UserSelectModal } from '../../../admin/channels/_modals/user-select/user-select.modal';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { Select, Option } from '@ngstarter-ui/components/select';

@Component({
  selector: 'studio-channel-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Panel,
    PanelHeader,
    PanelContent,
    Button,
    FormField,
    Label,
    Input,
    Hint,
    Error,
    UploadTriggerDirective,
    ImageProxyPipe,
    Icon,
    Accordion,
    ExpansionPanel,
    ExpansionPanelHeader,
    ExpansionPanelTitle,
    RouterLink,
    TextareaAutoSize,
    TranslocoPipe,
    Dicebear,
    Select,
    Option
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class ChannelEditComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private _api = inject(StudioChannelsApi);
  private _rawApi = inject(ApiService);
  private _snack = inject(SnackBar);
  private _router = inject(Router);
  private _subStore = inject(SubscriptionStore);
  private _route = inject(ActivatedRoute);
  private _breadcrumbs = inject(BreadcrumbsStore);
  private _appStore = inject(AppStore);
  private _dialog = inject(Dialog);
  private _translate = inject(TranslocoService);

  isNew = true;
  saving = false;
  id: string | null = null;
  siteUrl = this._appStore.hostUrl();
  loaded = signal(false);
  visibilities = signal<any[]>([]);

  accessTypes = signal([
    {type: 'subscribers', name: 'Subscribers'},
  ]);

  form = this._fb.group({
    name: ['', [Validators.required]],
    description: [''],
    slug: [
      '',
      [Validators.required, slugValidator()],
      channelUniqueSlugValidator(this._rawApi, this._route.snapshot.params['id'] || null, false)
    ],
    logoUrl: [''],
    logoId: [''],
    visibilityId: ['', [Validators.required]],
    accessType: ['', [Validators.required]],
    price: [0, [Validators.min(0)]],
    rules: [[] as ChannelRule[]],
    moderatorIds: [[] as string[]]
  });

  selectedModerators: User[] = [];

  get rules(): ChannelRule[] {
    return this.form.value.rules as ChannelRule[] || [];
  }

  ngOnInit() {
    this.id = this._route.snapshot.params['id'];
    this.isNew = !this.id;

    this._api.getVisibilities().subscribe((res) => {
      this.visibilities.set(res.visibilities || []);
      if (this.isNew && this.visibilities().length > 0) {
        const publicVisibility = this.visibilities().find((v: any) => v.type === 'public');
        if (publicVisibility) {
          this.form.patchValue({visibilityId: publicVisibility.id});
        } else {
          this.form.patchValue({visibilityId: this.visibilities()[0].id});
        }
      }
      this._checkAccessTypeStatus();
    });

    this.form.get('visibilityId')?.valueChanges.subscribe(() => {
      this._checkAccessTypeStatus();
    });

    if (!this.isNew && this.id) {
      this._api.getOne(this.id).subscribe((res) => {
        this.selectedModerators = res.channel.moderators ?? [];
        this.form.patchValue({
          name: res.channel.name,
          description: res.channel.description,
          slug: res.channel.slug,
          logoUrl: res.channel.logoUrl,
          logoId: res.channel.logoId,
          visibilityId: res.channel.visibilityId,
          accessType: res.channel.accessType,
          price: res.channel.price,
          rules: res.channel.rules,
          moderatorIds: res.channel.moderators?.map((m: any) => m.id) ?? []
        });
        this._checkAccessTypeStatus();
        this.loaded.set(true);
      });
    } else {
      this.loaded.set(true);
    }

    this._translate.selectTranslate(this.isNew ? 'studio.channels.edit.createTitle' : 'studio.channels.edit.editTitle').subscribe(() => {
      this._breadcrumbs.setBreadcrumbs([
        {id: 'home', route: '/', type: 'link', iconName: 'fluent:home-24-regular'},
        {id: 'studio', route: '/studio', name: 'studio.menu.dashboard', type: 'link'},
        {id: 'channels', route: '/studio/channels', name: 'studio.channels.list.title', type: 'link'},
        {
          id: 'edit',
          name: this.isNew ? 'studio.channels.edit.createTitle' : 'studio.channels.edit.editTitle',
          type: null
        }
      ]);
    });
  }

  isPublicVisibility(): boolean {
    const visibilityId = this.form.get('visibilityId')?.value;
    return this.visibilities()?.find((v) => v.id === visibilityId)?.type === 'public' || false;
  }

  private _checkAccessTypeStatus() {
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


  onLogoSelect(event: any) {
    const file = event.file;
    if (file) {
      this._api.uploadLogo(file).subscribe((res) => {
        this.form.patchValue({
          logoUrl: res.file.url,
          logoId: res.file.id
        });
      });
    }
  }

  deleteLogo() {
    this.form.patchValue({
      logoUrl: '',
      logoId: ''
    });
  }

  addRule() {
    const ref = this._dialog.open(NewRuleComponent, {width: '500px'});
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.form.patchValue({
          rules: [...this.rules, result as ChannelRule]
        });
      }
    });
  }

  editRule(event: Event, rule: ChannelRule, index: number) {
    event.stopPropagation();
    const ref = this._dialog.open(EditRuleComponent, {data: rule, width: '500px'});
    ref.afterClosed().subscribe((result) => {
      if (result) {
        const rules = [...this.rules];
        rules[index] = {...rules[index], ...result as ChannelRule};
        this.form.patchValue({rules});
      }
    });
  }

  deleteRule(event: Event, index: number) {
    event.stopPropagation();
    const rules = [...this.rules];
    rules.splice(index, 1);
    this.form.patchValue({rules});
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

  save() {
    if (this.form.invalid) {
      return;
    }

    this.saving = true;
    const obs = this.isNew ? this._api.create(this.form.value) : this._api.update(this.id!, this.form.value);
    obs.subscribe({
      next: (res: any) => {
        if (this.isNew && res.channelId) {
          this._subStore.add(res.channelId, 'channel');
        }
        this._snack.open(this._translate.translate('studio.channels.edit.saveSuccess'), '', {
          duration: 3000
        });
        this._router.navigate(['/studio/channels']);
      },
      error: () => {
        this._snack.open(this._translate.translate('studio.channels.edit.saveError'), '', {
          duration: 3000
        });
        this.saving = false;
      }
    });
  }
}
