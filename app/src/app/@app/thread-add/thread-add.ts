import { Component, ElementRef, inject, input, OnDestroy, output, signal, viewChild } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { Icon } from '@ngstarter-ui/components/icon';
import { ThreadService } from '@services/thread.service';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { AppStore } from '@store/app.store';
import { FormField } from '@ngstarter-ui/components/form-field';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { TextareaAutoSize } from '@ngstarter-ui/components/core';
import { EmojiPicker, EmojiPickerTriggerForDirective } from '@ngstarter-ui/components/emoji-picker';

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
    Input,
    FormField,
    ReactiveFormsModule,
    Button,
    Icon,
    UploadTriggerDirective,
    Card,
    CardContent,
    TextareaAutoSize,
    EmojiPicker,
    EmojiPickerTriggerForDirective
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
  private _textarea = viewChild<ElementRef<HTMLTextAreaElement>>('threadTextarea');

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

  post(): void {
    this.saving.set(true);
    const { content } = this.threadForm.getRawValue();
    const attachments = this.attachments();

    if (!content?.trim() && attachments.length === 0) {
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
        this.attachments().forEach(attachment => {
          URL.revokeObjectURL(attachment.previewUrl);
        });
        this.attachments.set([]);
        this.saving.set(false);
        this.itemAdded.emit();
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

  onFileSelected(event: UploadFileSelectedEvent) {
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

  onEmojiSelected(emoji: string) {
    const textarea = this._textarea()?.nativeElement;
    if (!textarea) return;

    const control = this.threadForm.controls.content;
    const value = control.value || '';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    let newValue = '';
    let newCursorPos = 0;

    const hasFocus = document.activeElement === textarea;

    if (hasFocus || (start !== null && end !== null && start !== end)) {
      newValue = value.slice(0, start) + emoji + value.slice(end);
      newCursorPos = start + emoji.length;
    } else {
      if (value.length === 0) {
        newValue = emoji;
        newCursorPos = emoji.length;
      } else {
        newValue = value + ' ' + emoji;
        newCursorPos = newValue.length;
      }
    }

    control.setValue(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }
}
