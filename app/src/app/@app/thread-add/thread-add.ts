import {
  Component,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild
} from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import {FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule} from '@angular/forms';
import { Icon } from '@ngstarter-ui/components/icon';
import { ThreadService } from '@services/thread.service';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { AppStore } from '@store/app.store';
import { EmojiPicker, EmojiPickerTriggerForDirective } from '@ngstarter-ui/components/emoji-picker';
import { CommentEditor, CommentEditorFooterBar } from "@ngstarter-ui/components/comment-editor";
import {TranslocoPipe} from "@jsverse/transloco";

export interface Attachment {
  file: File;
  url: SafeUrl;
  previewUrl: string;
  type: 'image' | 'video';
}

@Component({
  selector: 'app-thread-add',
  imports: [
    Button,
    ReactiveFormsModule,
    Button,
    Icon,
    UploadTriggerDirective,
    EmojiPicker,
    EmojiPickerTriggerForDirective,
    CommentEditor,
    CommentEditorFooterBar,
    TranslocoPipe
  ],
  templateUrl: './thread-add.html',
  styleUrl: './thread-add.scss',
  host: {
    '[class.hidden]': '!isLogged()'
  }
})
export class ThreadAdd implements OnDestroy {
  private _appStore = inject(AppStore);
  private formBuilder = inject(FormBuilder);
  private _threadService = inject(ThreadService);
  private _sanitizer = inject(DomSanitizer);
  readonly isLogged = this._appStore.isLogged;

  saving = signal(false);
  parentId = input<string>();

  private _formDirective = viewChild(FormGroupDirective);

  readonly threadForm = this.formBuilder.group({
    content: [''],
  });
  readonly attachments = signal<Attachment[]>([]);

  readonly itemAdded = output<void>();
  readonly canceled = output<void>();

  ngOnDestroy() {
    this.attachments().forEach(attachment => {
      URL.revokeObjectURL(attachment.previewUrl);
    });
  }

  post(editor: CommentEditor): void {
    this.saving.set(true);
    const { content } = this.threadForm.getRawValue();
    const attachments = this.attachments();

    if (!content?.trim() && attachments.length === 0) {
      this.saving.set(false);
      return;
    }

    const upload$ = attachments.length > 0
      ? forkJoin(
        attachments.map(attachment =>
          this._threadService.uploadFile(attachment.file).pipe(
            map(res => res.file.id)
          )
        )
      )
      : of([]);

    upload$.pipe(
      switchMap(mediaItemIds => this._threadService.create(content as string, mediaItemIds, this.parentId()))
    ).subscribe({
      next: () => {
        this._formDirective()?.resetForm();
        this.attachments.set([]);

        attachments.forEach(attachment => {
          URL.revokeObjectURL(attachment.previewUrl);
        });

        this.itemAdded.emit();
        editor.clear();
        editor.hideToolbar();
        editor.hideFullView();
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Failed to post thread', err);
        this.saving.set(false);
      }
    });
  }

  cancel(): void {
    this.canceled.emit();
  }

  onSent($event: any, threadForm: FormGroup, editor: CommentEditor) {
    threadForm.patchValue({ content: $event });
    this.post(editor);
  }

  onCanceled() {
    this.cancel();
  }

  onFileSelected(event: UploadFileSelectedEvent) {
    event.event.preventDefault();
    event.event.stopPropagation();

    const newAttachments: Attachment[] = [];
    Array.from(event.files).forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (isImage || isVideo) {
        const previewUrl = URL.createObjectURL(file);
        const url = this._sanitizer.bypassSecurityTrustUrl(previewUrl);
        newAttachments.push({
          file,
          url,
          previewUrl,
          type: isImage ? 'image' : 'video'
        });
      }
    });
    this.attachments.update(attachments => [...attachments, ...newAttachments]);
  }

  removeAttachment(index: number) {
    this.attachments.update(attachments => {
      const attachment = attachments[index];
      if (attachment) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
      attachments.splice(index, 1);
      return [...attachments];
    });
  }

  onEmojiSelected(emoji: string, editor: CommentEditor) {
    editor.insertText(emoji);
  }
}
