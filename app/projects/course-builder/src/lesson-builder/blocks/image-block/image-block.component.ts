import {
  Component,
  DestroyRef,
  forwardRef,
  inject,
  input,
  signal
} from '@angular/core';
import {
  UploadArea, UploadAreaDropStateDirective, UploadAreaInvalidStateDirective,
  UploadAreaMainStateDirective,
  UploadFileSelectedEvent,
  UploadTriggerDirective
} from '@ngstarter/components/upload';
import { Button } from '@ngstarter/components/button';
import { ProgressBar } from '@ngstarter/components/progress-bar';
import { ImageResizer, ImageResizerImageDirective } from '@ngstarter/components/image-resizer';
import { FormsModule } from '@angular/forms';
import { Icon } from '@ngstarter/components/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { LESSON_EDITOR_BLOCK } from '../../types';
import {
  LessonBuilderCommunicatorService
} from '../../lesson-builder-communicator.service';
import { ImageBlockData, LessonBlock } from '../../../models/lesson-block.model';
import {
  LessonBuilderComponent
} from '../../lesson-builder/lesson-builder.component';

@Component({
  selector: 'app-image-block',
  imports: [
    Icon,
    Button,
    ProgressBar,
    ImageResizerImageDirective,
    ImageResizer,
    UploadTriggerDirective,
    UploadArea,
    FormsModule,
    UploadAreaMainStateDirective,
    UploadAreaDropStateDirective,
    UploadAreaInvalidStateDirective
  ],
  providers: [
    {
      provide: LESSON_EDITOR_BLOCK,
      multi: true,
      useExisting: forwardRef(() => ImageBlockComponent)
    }
  ],
  templateUrl: './image-block.component.html',
  styleUrl: './image-block.component.scss',
  host: {
    '[class.align-left]': "block().data.align === 'left'",
    '[class.align-center]': "block().data.align === 'center'",
    '[class.align-right]': "block().data.align === 'right'",
  }
})
export class ImageBlockComponent {
  private communicator = inject(LessonBuilderCommunicatorService);
  private destroyRef = inject(DestroyRef);

  readonly block = input.required<LessonBlock<ImageBlockData>>();
  readonly builder = input.required<LessonBuilderComponent>();

  readonly uploading = signal(false);
  readonly selectedImage = signal<string>('');
  readonly initialized = signal(false);

  ngOnInit() {
    this.initialized.set(true);
    this.communicator
      .blockDataChanged()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((v: { blockId: any; data: any }) => v.blockId === this.block().id)
      )
      .subscribe((event: { blockId: any; data: any }) => {
        const data = event.data as Partial<ImageBlockData>;
        if (typeof data.src === 'string') this.block().data.src = data.src;
        if (typeof data.alt === 'string') this.block().data.alt = data.alt;
        if (typeof data.align === 'string') this.block().data.align = data.align as any;
        if (typeof data.width === 'number') this.block().data.width = data.width;
        if (typeof data.height === 'number') this.block().data.height = data.height;
      });
  }

  getData(): any {
    return {
      src: this.block().data.src,
      alt: this.block().data.alt,
      align: this.block().data.align,
      width: this.block().data.width,
      height: this.block().data.height,
    };
  }

  isEmpty(): boolean {
    const src = (this.getData().src || '').toString();
    return src.trim().length === 0;
  }

  protected cancelUploading() {
    this.uploading.set(false);
  }

  protected onFileSelected(event: UploadFileSelectedEvent): void {
    this.uploading.set(true);
    const reader  = new FileReader();
    reader.addEventListener('load', () => {
      this.selectedImage.set(reader.result as string);
      const formData = new FormData();
      formData.append('image', event.files[0]);
      // this
      //   .api
      //   .post('upload/image', formData).subscribe((res: any) => {
      //     if (!this.uploading()) {
      //       this.selectedImage.set('');
      //       return;
      //     }
      //
      //     this.block().data.src = res.url;
      //     this.selectedImage.set('');
      //     this.uploading.set(false);
      //     this.builder().emitChange();
      //   });
    }, false);
    reader.readAsDataURL(event.files[0]);
  }

  protected _onImageResized(options: any) {
    this.block().data.width = options.width;
    this.block().data.height = options.height;
    this.builder().emitChange();
  }
}
