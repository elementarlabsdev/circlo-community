import { Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LayoutContent, Layout, LayoutHeader } from '@ngstarter-ui/components/layout';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { ApiService } from '@services/api.service';
import { debounceTime, map, Subject, tap } from 'rxjs';
import { AssetsDataSource, ImageDesigner, ImageDesignerPhoto } from '@ngstarter-ui/components/image-designer';

@Component({
  imports: [
    LayoutContent,
    Layout,
    LayoutHeader,
    Icon,
    Button,
    RouterLink,
    TimeAgoPipe,
    TranslocoPipe,
    Tooltip,
    Button,
    ImageDesigner
  ],
  templateUrl: './common.html',
  styleUrl: './common.scss',
})
export class Common implements OnInit {
  private api = inject(ApiService);
  private activatedRoute = inject(ActivatedRoute);

  readonly imageDesigner = viewChild.required(ImageDesigner);

  loaded = signal(false);
  imageDesign = signal<any>(null);
  saving = signal(false);
  imageSize = signal({
    width: 700,
    height: 400
  });
  images = signal<ImageDesignerPhoto[]>([]);
  snapshot = signal(undefined);

  assetsDataSource: AssetsDataSource = {
    getItems: (params) => {
      this.api.get(`studio/image-designs/${this.imageDesignId}/images`).subscribe((res: any) => {
        const images = res.map((image: any) => ({
          url: image.url,
          id: image.id,
          width: image.payload.width,
          height: image.payload.height
        }));
        params.successCallback(images);
      });
    }
  };

  private saveSubject = new Subject<any>();

  get imageDesignId() {
    return this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    this.api.get(`studio/image-designs/${this.imageDesignId}`).subscribe((res: any) => {
      this.imageDesign.set(res);
      this.snapshot.set(res.snapshot);
      this.loaded.set(true);
    });

    this.saveSubject.pipe(
      debounceTime(1000)
    ).subscribe((snapshot) => {
      this.save(snapshot);
    });
  }

  uploadFn() {
    return (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return this.api.post(`studio/image-designs/${this.imageDesignId}/upload-image`, formData).pipe(
        map((res: any) => res.file)
      );
    }
  }

  downloadImageDesign() {
    this.imageDesigner().download();
  }

  onSnapshotChanged(snapshot: any) {
    this.saveSubject.next(snapshot);
  }

  save(snapshot: any) {
    this.saving.set(true);
    this.api.put(`studio/image-designs/${this.imageDesignId}`, {
      snapshot
    }).subscribe({
      next: (res: any) => {
        // this.imageDesign.set(res);
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  saveResultImageUrl() {
    const resultImageUrl = this.imageDesigner().getBase64Image();
    if (resultImageUrl) {
      this.api.patch(`studio/image-designs/${this.imageDesignId}/result-image`, {
        resultImageUrl
      }).subscribe();
    }
  }
}
