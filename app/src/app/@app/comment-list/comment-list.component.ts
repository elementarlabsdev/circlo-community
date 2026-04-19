import {
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
  SimpleChanges
} from '@angular/core';
import { ApiService } from '@services/api.service';
import { CommentEditorComponent } from '@app/comment-editor/comment-editor.component';
import { CommentComponent } from '@app/comment/comment.component';
import { Comment } from '@model/interfaces';
import {
  Skeleton,
} from '@ngstarter/components/skeleton';
import { TranslocoPipe } from '@jsverse/transloco';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { WebSocketService } from '@services/web-socket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppStore } from '@store/app.store';
import findRecursive from '@/_utils/find-recursive';

@Component({
  selector: 'app-comment-list',
  imports: [
    CommentEditorComponent,
    CommentComponent,
    Skeleton,
    TranslocoPipe,
  ],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss'
})
export class CommentListComponent implements OnInit, OnChanges {
  private _api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private webSocket = inject(WebSocketService);
  private destroyRef = inject(DestroyRef);
  private appStore = inject(AppStore);
  private document = inject(DOCUMENT);

  loaded = signal(false);
  targetId = input.required<string>();
  targetType = input.required<string>();
  commentsLength = input.required<number>();
  comments = signal<Comment[]>([]);
  threadCommentsDepth = signal<number>(0);
  depth = 1;

  readonly commentsAdded = output<void>();

  ngOnInit() {
    this.loadComments();

    if (isPlatformBrowser(this.platformId)) {
      this.webSocket.listen('addComment')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: any) => {
          if (res.lessonId !== this.targetId() && res.publicationId !== this.targetId()) {
            return;
          }

          this.comments.update((comments: Comment[]) => {
            comments.push({
              ...res.comment,
              isNew: true,
            });
            return comments;
          });

          if (!this.appStore.profile()) {
            return;
          }

          if (res.userId === this.appStore.profile()?.id) {
            setTimeout(() => {
              this.document.querySelector(`#comment-${res.comment.id}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
              });
            }, 100);
          }
        });
      this.webSocket.listen('addReplyToComment')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: any) => {
          if (res.lessonId !== this.targetId() && res.publicationId !== this.targetId()) {
            return;
          }

          const comments = [...this.comments()];
          const respondTo = findRecursive(
            comments,
            (comment: Comment) => comment.id === res.respondToId,
            'replies'
          );

          if (!respondTo) {
            // console.log('respondTo not found', res, comments);
            return;
          }

          if (!respondTo.replies) {
            respondTo.replies = [];
          }

          respondTo.replies.push({
            ...res.comment,
            isNew: true,
          });
          this.comments.set(comments);

          if (!this.appStore.profile()) {
            return;
          }

          if (res.userId === this.appStore.profile()?.id) {
            setTimeout(() => {
              this.document.querySelector(`#comment-${res.comment.id}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
              })
            }, 100);
          }
        });
      this.webSocket.listen('deleteComment')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: any) => {
          // console.log(res);
        });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['targetId'] && !changes['targetId'].firstChange) {
      this.loadComments();
    }
  }

  onSent(content: string): void {
    this._api
      .post(`${this.targetType()}/${this.targetId()}/comments`, {
        content
      })
      .subscribe((res: any) => {
        this.commentsAdded.emit();
      })
    ;
  }

  onReplyAdded(): void {
    this.commentsAdded.emit();
  }

  private loadComments() {
    this.loaded.set(false);
    this._api
      .get(`${this.targetType()}/${this.targetId()}/comments`)
      .subscribe((res: any) => {
        this.comments.set(res.comments);
        this.threadCommentsDepth.set(+res.threadCommentsDepth);
        this.loaded.set(true);
      });
  }
}
