import { Component, inject, OnInit, Signal, signal, computed } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '@services/api.service';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TUTORIAL_EDIT_ROOT } from '@/studio/tutorials/types';
import { EditComponent } from '@/studio/tutorials/edit/edit.component';
import { FormsModule } from '@angular/forms';
import { Timepicker, TimepickerInput, TimepickerToggle } from '@ngstarter/components/timepicker';
import { Input } from '@ngstarter/components/input';
import { FormField, Hint, Label, Suffix } from '@ngstarter/components/form-field';
import { Datepicker, DatepickerInput, DatepickerToggle } from '@ngstarter/components/datepicker';

@Component({
  selector: 'app-publish',
  imports: [
    Button,
    TranslocoPipe,
    DatePipe,
    FormsModule,
    Timepicker,
    TimepickerToggle,
    Input,
    Suffix,
    Label,
    FormField,
    Datepicker,
    DatepickerToggle,
    Hint,
    DatepickerInput,
    TimepickerInput
  ],
  templateUrl: './publish.html',
  styleUrl: './publish.scss'
})
export class Publish implements OnInit {
  private api = inject(ApiService);
  private editRoot = inject<EditComponent>(TUTORIAL_EDIT_ROOT);
  readonly data = inject(ROUTER_OUTLET_DATA) as Signal<{tutorialId: string}>;

  readonly loaded = signal(false);
  readonly tutorial = signal<any>(null);
  readonly saving = signal<any>(false);

  scheduledAt = signal<Date | null>(null);

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

  get tutorialId(): string {
    return this.data().tutorialId;
  }

  ngOnInit() {
    this.reload();
  }

  private reload() {
    this.api
      .get(`studio/tutorials/${this.tutorialId}/overview`)
      .subscribe((res: any) => {
        this.tutorial.set(res.tutorial);
        this.loaded.set(true);
      });
  }

  publish(): void {
    const payload: any = {};
    if (this.scheduledAt()) {
      payload.scheduledAt = this.scheduledAt();
    }
    this.api
      .post(`studio/tutorials/${this.tutorialId}/publish`, payload)
      .subscribe((res: any) => {
        this.tutorial.set(res.tutorial);
        this.editRoot.tutorial.set(res.tutorial);
      })
    ;
  }

  cancelSchedule(): void {
    this.api
      .delete(`studio/tutorials/${this.tutorialId}/schedule`)
      .subscribe((res: any) => {
        this.tutorial.set(res.tutorial);
        this.editRoot.tutorial.set(res.tutorial);
      })
    ;
  }
}
