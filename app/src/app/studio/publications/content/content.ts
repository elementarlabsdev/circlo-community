import { Component, DestroyRef, ElementRef, ViewChild, inject, model, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '@services/api.service';
import { Publication } from '@model/interfaces';
import { PUBLICATION_EDIT_ROOT } from '@/studio/publications/types';
import { EditComponent } from '@/studio/publications/edit/edit.component';
import { ContentBuilderComponent, ContentEditorBlock } from '@ngstarter/components/content-editor';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Button } from '@ngstarter/components/button';
import { UploadArea, UploadTriggerDirective } from '@ngstarter/components/upload';
import { Icon } from '@ngstarter/components/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TextareaAutoSize } from '@ngstarter/components/core';

@Component({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslocoPipe,
    ContentBuilderComponent,
    ImageProxyPipe,
    Button,
    Icon,
    UploadArea,
    UploadTriggerDirective,
    TextareaAutoSize,
  ],
  templateUrl: './content.html',
  styleUrl: './content.scss'
})
export class Content {
  private editRoot = inject<EditComponent>(PUBLICATION_EDIT_ROOT);
  private api = inject(ApiService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  form = this.formBuilder.group<any>({
    title: ['', [Validators.required]],
    blocksContent: [[], [Validators.required]],
  });

  featuredImageUploading = signal(false);
  featuredImageUrl = signal<string>('');
  publication = signal<Publication | null>(null);
  loaded = signal(false);
  blocksContent = signal<any[]>([]);
  pattern = model('none');
  options = signal({
    image: {
      uploadFn: (file: File, base64: string) => {
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append('image', file);
          this.api
            .post(this.imageUploadUrl, formData)
            .subscribe((res: any) => {
              resolve(res.file.url);
            });
        })
      }
    }
  });

  get imageUploadUrl() {
    return `studio/publication/edit/${this.editRoot.publicationHash()}/upload/image`;
  }

  ngOnInit() {
    this.api
      .get(`studio/publication/edit/${this.editRoot.publicationHash()}`)
      .subscribe((res: any) => {
        this.form.setValue({
          title: res.publication.title,
          blocksContent: res.publication.blocksContent,
        });
        this.blocksContent.set(res.publication.blocksContent);
        this.publication.set(res.publication);
        this.loaded.set(true);
        this._initAutoSaving();
      })
    ;
  }

  imageSelected(selectedFileEvent: any): void {
    this.editRoot.saving.set(true);
    this.featuredImageUploading.set(true);
    this.featuredImageUrl.set(window.URL.createObjectURL(selectedFileEvent.files[0]));
    const formData = new FormData();
    formData.append('image', selectedFileEvent.files[0]);
    this.api
      .post(`studio/publication/edit/${this.editRoot.publicationHash()}/featured-image`, formData)
      .subscribe((res: any) => {
        this.publication.set(res.publication);
        this.featuredImageUploading.set(false);
        this.editRoot.saving.set(false);
      })
    ;
  }

  deleteFeaturedImage(): void {
    this.editRoot.saving.set(true);
    this.featuredImageUrl.set('');
    this.api
      .delete(`studio/publication/edit/${this.editRoot.publicationHash()}/featured-image`)
      .subscribe((res: any) => {
        this.publication.set(res.publication);
        this.editRoot.saving.set(false);
      });
  }

  onContentChanged(blocksContent: ContentEditorBlock[]) {
    this.form.get('blocksContent')!.setValue(blocksContent);
  }

  private _initAutoSaving(): void {
    let timeout: any;
    this.form
      .valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        clearTimeout(timeout);
        this.editRoot.saving.set(true);
        timeout = setTimeout(() => {
          this.api
            .post(`studio/publication/edit/${this.editRoot.publicationHash()}/content`, value)
            .subscribe((res: any) => {
              this.publication.set(res.publication);
              this.editRoot.publication.set(res.publication);
              this.editRoot.saving.set(false);
            }, (error) => {
              this.editRoot.saving.set(false);
            });
        }, 1000);
      });
  }
}
