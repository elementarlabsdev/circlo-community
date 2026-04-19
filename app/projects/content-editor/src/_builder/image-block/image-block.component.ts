import { ChangeDetectionStrategy, Component, forwardRef, inject, input, model, OnInit, signal } from '@angular/core';
import { UploadArea, UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter/components/upload';
import { ProgressBar } from '@ngstarter/components/progress-bar';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import {
  CONTENT_BUILDER,
  CONTENT_EDITOR_BLOCK, ContentEditorDataBlock,
  ContentEditorImageBlockSettings,
  ContentEditorImageContent
} from '../../types';
import { ImageResizer, ImageResizerImageDirective } from '@ngstarter/components/image-resizer';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { FormsModule } from '@angular/forms';
import { ContentBuilderStore } from '../../content-builder.store';
import { ContentBuilderComponent } from '@elementar-uix/components/content-editor';

@Component({
  selector: 'ngs-image-block',
  imports: [
    UploadArea,
    UploadTriggerDirective,
    ProgressBar,
    Button,
    Icon,
    ImageResizer,
    FormField,
    Input,
    FormsModule,
    ImageResizerImageDirective,
    Label
  ],
  providers: [
    {
      provide: CONTENT_EDITOR_BLOCK,
      useExisting: forwardRef(() => ImageBlockComponent),
      multi: true
    }
  ],
  templateUrl: './image-block.component.html',
  styleUrl: './image-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keypress)': 'handleKeyPress($event)',
  }
})
export class ImageBlockComponent implements OnInit, ContentEditorDataBlock {
  private _store = inject(ContentBuilderStore);
  private _contentBuilder = inject<ContentBuilderComponent>(CONTENT_BUILDER);

  id = input.required<string>();
  content = input.required<ContentEditorImageContent>();
  settings = input.required<ContentEditorImageBlockSettings>();
  index = input.required<number>();

  uploading = signal(false);
  selectedImage = signal<string>('');

  protected _src = signal<string>('');
  protected _alt = model<string>('');
  protected _settings = model<ContentEditorImageBlockSettings | object>({});
  readonly initialized = signal(false);

  ngOnInit() {
    this._src.set(this.content().src);
    this._alt.set(this.content().alt);
    this._settings.set(this._settings());
    this.initialized.set(true);
  }

  focus() {
    if (this._src()) {
      this._contentBuilder.focusBlock(this.id());
    }
  }

  getData(): any {
    return {
      content: {
        src: this._src(),
        alt: this._alt()
      },
      settings: {
        ...this._settings(),
      }
    };
  }

  isEmpty(): boolean {
    return this.getData().content.src.trim().length === 0;
  }

  protected cancelUploading() {
    this.uploading.set(false);
  }

  protected onFileSelected(event: UploadFileSelectedEvent): void {
    this.uploading.set(true);
    const reader  = new FileReader();
    reader.addEventListener('load', () => {
      this.selectedImage.set(reader.result as string);
      const uploadFn = this._contentBuilder.getBlockDefOption('image', 'uploadFn');
      uploadFn(event.files[0], reader.result)
        .then((url: string) => {
          if (!this.uploading()) {
            this.selectedImage.set('');
            return;
          }

          this._src.set(url);
          this.selectedImage.set('');
          this.uploading.set(false);
          this.update();
          this.focus();
        });
    }, false);
    reader.readAsDataURL(event.files[0]);
  }

  protected _onAltChange() {
    this.update();
  }

  protected _onImageResized(options: any) {
    this._settings.set(options);
    this.update();
  }

  protected handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this._contentBuilder.insertEmptyBlock(this.index());
    }
  }

  private update() {
    this._store.updateBlock(this.id(), {...this.getData(), isEmpty: this.isEmpty()});
    this._contentBuilder.emitContentChangeEvent();
  }
}
