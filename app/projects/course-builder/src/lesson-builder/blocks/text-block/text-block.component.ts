import { ChangeDetectionStrategy, Component, forwardRef, input, OnInit, signal } from '@angular/core';
import { CardModule } from '@ngstarter/components/card';
import { FormFieldModule } from '@ngstarter/components/form-field';
import { InputModule } from '@ngstarter/components/input';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TextEditorBubbleMenuComponent,
  TextEditorCommandBlockquoteDirective,
  TextEditorCommandBoldDirective,
  TextEditorCommandCodeDirective,
  TextEditorCommandDirective,
  TextEditorCommandEditLinkDirective,
  TextEditorCommandHorizontalRuleDirective,
  TextEditorCommandItalicDirective,
  TextEditorCommandLinkDirective,
  TextEditorCommandStrikeDirective,
  TextEditorCommandUnsetLinkDirective,
  TextEditorComponent,
  TextEditorDividerComponent,
  TextEditorFloatingMenuComponent,
} from '@ngstarter/components/text-editor';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Tooltip } from '@ngstarter/components/tooltip';
import { LESSON_EDITOR_BLOCK } from '../../types';
import { LessonBlock, TextBlockData } from '../../../models/lesson-block.model';
import {
  LessonBuilderComponent
} from '../../lesson-builder/lesson-builder.component';

@Component({
  selector: 'app-text-block',
  imports: [
    CardModule,
    FormFieldModule,
    InputModule,
    ReactiveFormsModule,
    TextEditorComponent,
    Icon,
    Button,
    Tooltip,
    TextEditorBubbleMenuComponent,
    TextEditorDividerComponent,
    TextEditorCommandDirective,
    TextEditorCommandBoldDirective,
    TextEditorCommandItalicDirective,
    TextEditorCommandStrikeDirective,
    TextEditorCommandBlockquoteDirective,
    TextEditorCommandEditLinkDirective,
    TextEditorCommandUnsetLinkDirective,
    TextEditorCommandLinkDirective,
    TextEditorCommandCodeDirective,
    TextEditorCommandHorizontalRuleDirective,
    TextEditorFloatingMenuComponent
  ],
  providers: [
    {
      provide: LESSON_EDITOR_BLOCK,
      multi: true,
      useExisting: forwardRef(() => TextBlockComponent)
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './text-block.component.html',
  styleUrl: './text-block.component.scss',
})
export class TextBlockComponent implements OnInit {
  block = input.required<LessonBlock<TextBlockData>>();
  builder = input.required<LessonBuilderComponent>();

  private localContent = signal<string>('');

  ngOnInit() {
    this.localContent.set(this.block().data.content);
  }

  getData(): any {
    return {
      content: this.localContent(),
    };
  }

  onContentChange(content: string) {
    if (content === this.localContent()) {
      return;
    }

    this.localContent.set(content);
    this.builder().emitChange();
  }
}
