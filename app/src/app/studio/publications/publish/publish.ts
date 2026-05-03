import { Component, computed, inject, model, OnInit, signal } from '@angular/core';
import { EditComponent } from '@/studio/publications/edit/edit.component';
import { PUBLICATION_EDIT_ROOT } from '@/studio/publications/types';
import { ApiService } from '@services/api.service';
import { Button } from '@ngstarter-ui/components/button';
import { FormsModule } from '@angular/forms';
import { Alert } from '@ngstarter-ui/components/alert';
import { TranslocoPipe } from '@jsverse/transloco';
import { DatePipe } from '@angular/common';
import { Timepicker, TimepickerInput, TimepickerToggle } from '@ngstarter-ui/components/timepicker';
import { Input } from '@ngstarter-ui/components/input';
import { FormField, Hint, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Datepicker, DatepickerInput, DatepickerToggle } from '@ngstarter-ui/components/datepicker';

@Component({
  imports: [
    Button,
    FormsModule,
    TranslocoPipe,
    DatePipe,
    Timepicker,
    TimepickerToggle,
    Input,
    FormField,
    Label,
    TimepickerInput,
    Datepicker,
    DatepickerToggle,
    Hint,
    DatepickerInput,
    IconButtonSuffix
  ],
  templateUrl: './publish.html',
  styleUrl: './publish.scss'
})
export class Publish implements OnInit {
  private editRoot = inject<EditComponent>(PUBLICATION_EDIT_ROOT);
  private api = inject(ApiService);

  publishing = signal(false);

  publication = computed(() => this.editRoot.publication());
  scheduledAt = model<Date | null>(null);

  scheduledDate = computed(() => this.scheduledAt());
  scheduledTime = computed(() => this.scheduledAt());

  updateDate(date: Date | null) {
    const current = this.scheduledAt();
    if (!date) {
      this.scheduledAt.set(null);
      return;
    }
    const newDate = new Date(date);
    if (current) {
      newDate.setHours(current.getHours(), current.getMinutes(), 0, 0);
    }
    this.scheduledAt.set(newDate);
  }

  updateTime(time: Date | string | null) {
    const current = this.scheduledAt() || new Date();
    let newDate = new Date(current);
    if (time instanceof Date) {
      newDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
    } else if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
      const [h, m] = time.split(':').map(Number);
      newDate.setHours(h, m, 0, 0);
    } else {
      return;
    }
    this.scheduledAt.set(newDate);
  }

  ngOnInit() {
  }

  publish(): void {
    this.publishing.set(true);
    const payload: any = {};

    if (this.scheduledAt()) {
      payload.scheduledAt = this.scheduledAt();
    }

    this.api
      .post(`studio/publication/${this.editRoot.publicationHash()}/publish`, payload)
      .subscribe((res: any) => {
        this.editRoot.publication.set(res.publication);
        this.publishing.set(false);
      });
  }

  cancelSchedule(): void {
    this.api
      .post(`studio/publication/${this.editRoot.publicationHash()}/cancel-schedule`, {})
      .subscribe((res: any) => {
        this.editRoot.publication.set(res.publication);
      });
  }
}
