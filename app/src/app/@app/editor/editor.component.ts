import {
  AfterViewInit,
  Component, ElementRef, inject,
  input, OnDestroy,
  OnInit,
  output, PLATFORM_ID,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Crepe } from '@milkdown/crepe';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import { upload, uploadConfig, Uploader } from "@milkdown/kit/plugin/upload";
import type { Node } from "@milkdown/kit/prose/model";
import { ApiService } from '@services/api.service';
// import { emoji } from '@milkdown/plugin-emoji'; not worked

const uploader: Uploader = async (files, schema) => {
  const images: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i);
    if (!file) {
      continue;
    }

    // You can handle whatever the file type you want, we handle image here.
    if (!file.type.includes("image")) {
      continue;
    }

    images.push(file);
  }

  const nodes: Node[] = await Promise.all(
    images.map(async (image) => {
      const src = 'data:image/png;base64,';
      const alt = image.name;
      return schema.nodes['image'].createAndFill({
        src,
        alt,
      }) as Node;
    }),
  );

  return nodes;
};

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss'
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  private _elementRef = inject(ElementRef);
  private _platformId = inject(PLATFORM_ID);
  private _api = inject(ApiService);

  content = input<any>('');
  imageUploadUrl = input.required<string>();
  placeholder = input<string>('editor.defaultPlaceholder');
  headerPlaceholder = input<string>('editor.defaultHeaderPlaceholder');

  readonly contentChange = output<string>();

  private editor!: Crepe;

  private _content = '';

  ngOnInit() {
    this._content = this.content();
  }

  async ngAfterViewInit() {
    if (isPlatformServer(this._platformId)) {
      return;
    }

    this.editor = new Crepe({
      root: this._elementRef.nativeElement,
      defaultValue: this.content(),
      featureConfigs: {
        [Crepe.Feature.ImageBlock]: {
          blockOnUpload: (file: File) => {
            return new Promise((resolve, reject) => {
              const formData = new FormData();
              formData.append('image', file);
              this._api
                .post(this.imageUploadUrl(), formData)
                .subscribe((res: any) => {
                  resolve(res.file.url);
                }, error => {
                  reject(error);
                });
            });
          }
        },
      },
    });
    this.editor
      .editor
      .use(upload);

    await this.editor.create();

    setInterval(() => {
      const markdown = this.editor.getMarkdown();

      if (this._content !== markdown) {
        this.contentChange.emit(markdown);
        this._content = markdown;
      }
    }, 5_000);
  }

  async ngOnDestroy() {
    await this.editor?.destroy();
  }
}
