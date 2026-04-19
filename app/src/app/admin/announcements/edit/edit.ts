import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnnouncementsApi } from '../announcements.api';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { TranslocoPipe } from '@jsverse/transloco';
import { Select, Option } from '@ngstarter/components/select';
import { Checkbox } from '@ngstarter/components/checkbox';
import { Datepicker, DatepickerInput, DatepickerToggle } from '@ngstarter/components/datepicker';
import { Input } from '@ngstarter/components/input';
import { Error, FormField, Label, Suffix } from '@ngstarter/components/form-field';
import { Timepicker, TimepickerInput, TimepickerToggle } from '@ngstarter/components/timepicker';

@Component({
  standalone: true,
  selector: 'admin-announcements-edit',
  providers: [
  ],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    Select,
    Option,
    Checkbox,
    Panel,
    PanelHeader,
    PanelContent,
    ScrollbarArea,
    TranslocoPipe,
    DatepickerInput,
    DatepickerToggle,
    Input,
    Datepicker,
    Suffix,
    Label,
    FormField,
    TimepickerInput,
    TimepickerToggle,
    Timepicker,
    Error,
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.scss',
})
export class Edit implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AnnouncementsApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  saving = signal(false);
  id = signal('');
  types = signal<any[]>([]);
  statuses = signal<any[]>([]);
  loaded = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    content: ['', Validators.required],
    statusType: ['', Validators.required],
    typeType: ['', Validators.required],
    priority: [0],
    dismissable: [true],
    requireManualDismiss: [false],
    targetUrl: [''],
    actionText: [''],
    startAt: [null as any, Validators.required],
    endAt: [null as any],
  });

  constructor() {
    this.breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'admin',
        route: '/admin',
        name: this.translate.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'announcements',
        route: '/admin/announcements',
        name: this.translate.instant('breadcrumbs.admin.announcements'),
        type: 'link'
      },
      {
        id: 'edit',
        name: this.translate.instant('breadcrumbs.admin.announcements.edit'),
        type: null
      }
    ]);
  }

  ngOnInit() {
    this.id.set(this.route.snapshot.params['id']);
    this.loadMeta();
    this.loadAnnouncement();
  }

  loadMeta() {
    this.api.getTypes().subscribe(types => this.types.set(types));
    this.api.getStatuses().subscribe(statuses => this.statuses.set(statuses));
  }

  loadAnnouncement() {
    this.api.findById(this.id()).subscribe({
      next: (ann: any) => {
        this.form.patchValue({
          name: ann.name,
          content: ann.content,
          statusType: ann.status.type,
          typeType: ann.type.type,
          priority: ann.priority,
          dismissable: ann.dismissable,
          requireManualDismiss: ann.requireManualDismiss,
          targetUrl: ann.targetUrl,
          actionText: ann.actionText,
          startAt: ann.startAt ? new Date(ann.startAt) : null,
          endAt: ann.endAt ? new Date(ann.endAt) : null,
        });
        this.loaded.set(true);
      },
      error: () => {
        this.snack.open(this.translate.instant('announcements.failedToLoadAnnouncement'), undefined, { duration: 3000 });
        this.router.navigate(['/admin/announcements']);
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const val = this.form.value as any;
    if (val.startAt) val.startAt = new Date(val.startAt).toISOString();
    if (val.endAt) val.endAt = new Date(val.endAt).toISOString();

    this.api.update(this.id(), val).subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(this.translate.instant('announcements.announcementUpdated'), undefined, { duration: 2000 });
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message || this.translate.instant('common.saveFailed'), undefined, { duration: 3000 });
      }
    });
  }
}
