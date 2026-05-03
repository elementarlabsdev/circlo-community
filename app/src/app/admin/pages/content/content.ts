import { Component, DestroyRef, inject, model, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { PagesApi } from '../pages.api';
import { ADMIN_PAGE_EDIT_ROOT, Edit } from '@/admin/pages/edit/edit';
import { ContentBuilderComponent, ContentEditorBlock } from '@ngstarter-ui/components/content-editor';
import { TranslocoPipe } from '@jsverse/transloco';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Button } from '@ngstarter-ui/components/button';
import { UploadArea, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import { Icon } from '@ngstarter-ui/components/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TextareaAutoSize } from '@ngstarter-ui/components/core';

@Component({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ContentBuilderComponent,
    TranslocoPipe,
    ImageProxyPipe,
    Button,
    Icon,
    UploadArea,
    UploadTriggerDirective,
    TextareaAutoSize,
  ],
  templateUrl: './content.html',
  styleUrl: './content.scss',
})
export class Content {
  private editRoot = inject<Edit>(ADMIN_PAGE_EDIT_ROOT);
  private api = inject(PagesApi);
  private snack = inject(SnackBar);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  saving = signal(false);
  page = signal<any>(null);
  loaded = signal(false);
  blocksContent = signal<any[]>([]);
  pattern = model('none');
  featuredImageUploading = signal(false);
  featuredImageUrl = signal('');
  options = signal({
    image: {
      uploadFn: (file: File, base64: string) => {
        return new Promise((resolve, reject) => {
          this.api
            .uploadInlineImage(this.editRoot.pageId(), file)
            .subscribe((res: any) => {
              resolve(res.file.url);
            });
        })
      }
    }
  });

  private timeout: any = null;
  form = this.fb.group({
    title: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    blocksContent: this.fb.nonNullable.control<ContentEditorBlock[]>([]),
  });

  ngOnInit() {
    const hash = this.editRoot.pageHash();
    this.api.getContent(hash).subscribe({
      next: (res: any) => {
        this.page.set(res.page);
        this.form.setValue({
          title: res.page.title,
          blocksContent: res.page.blocksContent
        });
        this.blocksContent.set(res.page.blocksContent);
        this._initAutoSave();
        this.loaded.set(true);
      },
      error: () => {
        this.snack.open('Failed to load page', undefined, { duration: 3000 });
      }
    });
  }

  imageSelected(event: any) {
    const file: File | undefined = event?.files?.[0];
    if (!file) {
      return;
    }
    this.editRoot.saving.set(true);
    const id = this.editRoot.pageId();
    this.featuredImageUploading.set(true);
    this.api.uploadFeaturedImage(id, file).subscribe({
      next: (res: any) => {
        this.page.set(res.page);
        this.editRoot.page.set(res.page);
        this.featuredImageUrl.set(res.page.featuredImageUrl || '');
        this.featuredImageUploading.set(false);
        this.editRoot.saving.set(false);
        this.snack.open('Image uploaded', undefined, { duration: 2000 });
      },
      error: () => {
        this.featuredImageUploading.set(false);
        this.snack.open('Image upload failed', undefined, { duration: 3000 });
      }
    });
  }

  deleteFeaturedImage() {
    const id = this.editRoot.pageId();
    this.editRoot.saving.set(true);
    this.api.deleteFeaturedImage(id).subscribe({
      next: (res: any) => {
        this.page.set(res.page);
        this.editRoot.page.set(res.page);
        this.featuredImageUrl.set('');
        this.editRoot.saving.set(false);
        this.snack.open('Image deleted', undefined, { duration: 2000 });
      },
      error: () => this.snack.open('Delete failed', undefined, { duration: 3000 })
    });
  }

  onContentChanged(value: ContentEditorBlock[]) {
    this.form.get('blocksContent')?.setValue(value);
  }

  private _initAutoSave() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.saving.set(true);
        this.editRoot.saving.set(true);
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          if (this.form.invalid) {
            return;
          }
          this.api.saveContent(this.editRoot.pageId(), value).subscribe({
            next: (res: any) => {
              this.page.set(res.page);
              this.editRoot.page.set(res.page);
              this.saving.set(false);
              this.editRoot.saving.set(false);
            },
            error: () => {
              this.saving.set(false);
              this.snack.open('Auto-save failed', undefined, { duration: 3000 });
            }
          });
        }, 1000);
      });
  }
}
