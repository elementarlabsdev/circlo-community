import { Component, DestroyRef, EventEmitter, inject, input, OnInit } from '@angular/core';
import { FormField, Input, Label } from '@ngstarter/components/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Option, Select } from '@ngstarter/components/select';
import {
  LessonBuilderCommunicatorService
} from '../../lesson-builder-communicator.service';
import { ImageBlockData, LessonBlock } from '../../../models/lesson-block.model';

@Component({
  selector: 'app-image-block-settings',
  imports: [
    Input,
    Label,
    FormField,
    ReactiveFormsModule,
    Select,
    Option,
  ],
  templateUrl: './image-block-settings.component.html',
  styleUrl: './image-block-settings.component.scss'
})
export class ImageBlockSettingsComponent implements OnInit {
  private communicator = inject(LessonBuilderCommunicatorService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly block = input.required<LessonBlock<ImageBlockData>>();
  readonly settingsChanged = input.required<EventEmitter<any>>();
  protected form!: FormGroup;

  ngOnInit() {
    this.form = this.formBuilder.group({
      alt: [this.block().data.alt],
      align: [this.block().data.align]
    });
    this.form
      .valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: any) => {
        this.communicator.updateBlockData(this.block().id, value);
      });
  }
}
