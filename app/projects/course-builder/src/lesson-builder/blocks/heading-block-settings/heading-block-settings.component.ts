import { Component, DestroyRef, EventEmitter, inject, input, OnInit } from '@angular/core';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Option } from '@ngstarter/components/autocomplete';
import { Select } from '@ngstarter/components/select';
import {
  LessonBuilderCommunicatorService
} from '../../lesson-builder-communicator.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  HeadingBlockData,
  LessonBlock
} from '../../../models/lesson-block.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ngs-heading-block-settings',
  imports: [
    FormField,
    Label,
    Option,
    Select,
    ReactiveFormsModule
  ],
  templateUrl: './heading-block-settings.component.html',
  styleUrl: './heading-block-settings.component.scss'
})
export class HeadingBlockSettingsComponent implements OnInit {
  private communicator = inject(LessonBuilderCommunicatorService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly block = input.required<LessonBlock<HeadingBlockData>>();
  readonly settingsChanged = input.required<EventEmitter<any>>();
  protected form!: FormGroup;

  ngOnInit() {
    this.form = this.formBuilder.group({
      level: [this.block().data.level],
    });
    this.form
      .valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: any) => {
        this.communicator.updateBlockData(this.block().id, value);
      });
  }
}
