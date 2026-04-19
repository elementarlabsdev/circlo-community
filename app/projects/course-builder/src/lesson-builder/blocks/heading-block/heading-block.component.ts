import { ChangeDetectionStrategy, Component, DestroyRef, forwardRef, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LESSON_EDITOR_BLOCK } from '../../types';
import { HeadingBlockData, ImageBlockData, LessonBlock } from '../../../models/lesson-block.model';
import { LessonBuilderComponent } from '../../lesson-builder/lesson-builder.component';
import { InlineTextEdit } from '@ngstarter/components/inline-text-edit';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { LessonBuilderCommunicatorService } from '../../lesson-builder-communicator.service';

@Component({
  selector: 'app-heading-block',
  imports: [
    CommonModule,
    FormsModule,
    InlineTextEdit
  ],
  templateUrl: './heading-block.component.html',
  styleUrl: './heading-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: LESSON_EDITOR_BLOCK,
      multi: true,
      useExisting: forwardRef(() => HeadingBlockComponent)
    }
  ]
})
export class HeadingBlockComponent {
  private communicator = inject(LessonBuilderCommunicatorService);
  private destroyRef = inject(DestroyRef);

  block = input.required<LessonBlock<HeadingBlockData>>();
  builder = input.required<LessonBuilderComponent>();

  protected localContent = signal<string>('');
  protected localLevel = signal<number>(2);

  ngOnInit() {
    this.localContent.set(this.block().data.content || '');
    const level = Number(this.block().data.level || 2);
    this.localLevel.set(isFinite(level) && level >= 1 && level <= 6 ? level : 2);
    this.communicator
      .blockDataChanged()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((v: { blockId: any; data: any }) => v.blockId === this.block().id)
      )
      .subscribe((event: { blockId: any; data: any }) => {
        this.localLevel.set(event.data.level);
        this.builder().emitChange();
      });
  }

  getData(): HeadingBlockData {
    return {
      content: this.localContent(),
      level: this.localLevel()
    };
  }

  protected onChanged(value: string) {
    if (value === this.localContent()) {
      return
    }

    this.localContent.set(value);
    this.builder().emitChange();
  }
}
