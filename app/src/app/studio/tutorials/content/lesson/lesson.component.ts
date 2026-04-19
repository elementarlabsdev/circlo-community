import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { Button } from '@ngstarter/components/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip } from '@ngstarter/components/tooltip';
import { ContentBuilderComponent } from '@elementar-uix/components/content-editor';
import { TUTORIAL_EDIT_ROOT } from '@/studio/tutorials/types';
import { EditComponent } from '@/studio/tutorials/edit/edit.component';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';

@Component({
  imports: [
    Panel,
    PanelHeader,
    PanelContent,
    RouterLink,
    TranslocoPipe,
    Icon,
    Tooltip,
    Button,
    ContentBuilderComponent,
    ScrollbarArea,
  ],
  templateUrl: './lesson.component.html',
  styleUrl: './lesson.component.scss'
})
export class LessonComponent implements OnInit {
  private api = inject(ApiService);
  private activatedRoute = inject(ActivatedRoute);
  private editRoot = inject<EditComponent>(TUTORIAL_EDIT_ROOT);
  readonly data = inject(ROUTER_OUTLET_DATA) as Signal<{tutorialId: string}>;
  readonly loaded = signal(false);
  readonly lesson = signal<any>(null);

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
    return `studio/tutorials/${this.data().tutorialId}/upload/image`;
  }

  private timer!: any;

  get tutorialUrl(): string {
    return `/studio/tutorials/${this.data().tutorialId}/content`;
  }

  ngOnInit() {
    const lessonId = this.activatedRoute.snapshot.params['id'];
    this.api
      .get(`studio/tutorials/lessons/${lessonId}`)
      .subscribe((res: any) => {
        this.lesson.set(res.lesson);
        this.loaded.set(true);
      });
  }

  onContentChanged(blocksContent: any[]) {
    clearTimeout(this.timer);
    this.editRoot.saving.set(true);
    this.timer = setTimeout(() => {
      this.api.post(`studio/tutorials/lessons/${this.lesson().id}/content`, {
        blocksContent
      }).subscribe((res: any) => {
        this.editRoot.tutorial.set({
          ...this.editRoot.tutorial(),
          updatedAt: new Date(),
          hasChanges: true,
          version: this.editRoot.tutorial().version + 1,
        });
        this.editRoot.saving.set(false);
      });
    }, 1000);
  }
}
