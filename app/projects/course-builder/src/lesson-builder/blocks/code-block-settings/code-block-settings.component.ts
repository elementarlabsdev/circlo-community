import { Component, DestroyRef, EventEmitter, inject, input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrderByPipe } from '@ngstarter/components/core';
import { Label, Option, Select } from '@ngstarter/components/select';
import { FormField } from '@ngstarter/components/input';
import { CodeBlockData, LessonBlock } from '../../../models/lesson-block.model';
import {
  LessonBuilderCommunicatorService
} from '../../lesson-builder-communicator.service';
import { codeLanguages } from '../../../models/code-block.model';

@Component({
  selector: 'app-code-block-settings',
  imports: [
    FormField,
    Select,
    Option,
    OrderByPipe,
    ReactiveFormsModule,
    Label
  ],
  templateUrl: './code-block-settings.component.html',
  styleUrl: './code-block-settings.component.scss'
})
export class CodeBlockSettingsComponent {
  private communicator = inject(LessonBuilderCommunicatorService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly block = input.required<LessonBlock<CodeBlockData>>();
  readonly settingsChanged = input.required<EventEmitter<any>>();
  protected form!: FormGroup;

  protected languages = signal<any[]>(codeLanguages);

  ngOnInit() {
    this.form = this.formBuilder.group({
      language: [this.block().data.language],
    });
    this.form
      .valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: any) => {
        this.communicator.updateBlockData(this.block().id, value);
      });
  }
}
