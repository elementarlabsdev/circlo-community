import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnnouncementsApi } from '../announcements.api';
import { Router, RouterLink } from '@angular/router';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { Select, Option } from '@ngstarter/components/select';
import { Checkbox } from '@ngstarter/components/checkbox';
import { Error, FormField, Label, Suffix } from '@ngstarter/components/form-field';
import { Datepicker, DatepickerInput, DatepickerToggle } from '@ngstarter/components/datepicker';
import { Input } from '@ngstarter/components/input';
import { Timepicker, TimepickerInput, TimepickerToggle } from '@ngstarter/components/timepicker';

@Component({
  standalone: true,
  selector: 'admin-announcements-new',
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
    TranslocoPipe,
    ScrollbarArea,
    Suffix,
    DatepickerToggle,
    Datepicker,
    Input,
    Label,
    FormField,
    TimepickerToggle,
    Timepicker,
    DatepickerInput,
    TimepickerInput,
    Error
  ],
  templateUrl: './new.html',
  styleUrl: './new.scss',
})
export class New {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AnnouncementsApi);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  saving = signal(false);
  types = signal<any[]>([]);
  statuses = signal<any[]>([]);

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
    startAt: [new Date() as any, Validators.required],
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
        id: 'new',
        name: this.translate.instant('breadcrumbs.admin.announcements.new'),
        type: null
      }
    ]);
    this.loadMeta();
  }

  loadMeta() {
    this.api.getTypes().subscribe(types => this.types.set(types));
    this.api.getStatuses().subscribe(statuses => this.statuses.set(statuses));
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.saving.set(true);
    const val = this.form.value as any;
    if (val.startAt) val.startAt = new Date(val.startAt).toISOString();
    if (val.endAt) val.endAt = new Date(val.endAt).toISOString();

    this.api.create(val).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.snack.open(this.translate.instant('announcements.announcementCreated'), undefined, { duration: 2000 });
        this.router.navigate(['/admin/announcements', res.id, 'edit']);
      },
      error: (err) => {
        this.saving.set(false);
        this.snack.open(err?.error?.message || this.translate.instant('common.saveFailed'), undefined, { duration: 3000 });
      }
    });
  }
}
