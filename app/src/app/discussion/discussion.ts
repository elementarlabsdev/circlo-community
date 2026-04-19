import { Component, inject, signal, computed, PLATFORM_ID, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@services/api.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { CommentComponent } from '@app/comment/comment.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Comment } from '@model/interfaces';
import findRecursive from '@/_utils/find-recursive';
import { WebSocketService } from '@services/web-socket.service';
import { AppStore } from '@store/app.store';

@Component({
  selector: 'app-discussion',
  imports: [CommentComponent],
  templateUrl: './discussion.html',
  styleUrl: './discussion.scss',
})
export class Discussion {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private webSocket = inject(WebSocketService);
  private destroyRef = inject(DestroyRef);
  private document = inject(DOCUMENT);
  private appStore = inject(AppStore);

  loaded = signal(false);
  loadingError = signal<string | null>(null);
  rootComment = signal<any | null>(null);
  threadCommentsDepth = signal<number>(0);

  targetType = computed(() => {
    const c = this.rootComment();
    if (c.publication?.id || c.publicationId) return 'publication';
    if (c.lesson?.id || c.lessonId) return 'lesson';
    return '';
  });
  targetId = computed(() => {
    const c = this.rootComment();
    if (!c) return '';
    return (
      c.publication?.id || c.publicationId || c.lesson?.id || c.lessonId || ''
    );
  });
  nestedRepliesCount(): number {
    const c: any = this.rootComment();
    return typeof c?.nestedRepliesCount === 'number' ? c.nestedRepliesCount : 0;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.fetch(id);

    if (isPlatformBrowser(this.platformId)) {
      this.webSocket.listen('addReplyToComment')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((res: any) => {
          if (res.lessonId !== this.targetId()) {
            return;
          }

          const replies = [...this.rootComment().replies];
          const respondTo = findRecursive(
            this.rootComment().replies, (comment: Comment) => comment.id === res.respondToId
          );

          if (!respondTo) {
            return;
          }

          if (!respondTo.replies) {
            respondTo.replies = [];
          }

          respondTo.replies.push({
            ...res.comment,
            isNew: true,
          });
          this.rootComment().replies = replies;

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

  fetch(id: string) {
    this.loaded.set(false);
    this.loadingError.set(null);
    this.api.get(`discussion/${id}`).subscribe({
      next: (res: any) => {
        this.rootComment.set(res.comment);
        this.threadCommentsDepth.set(res.threadCommentsDepth);
        if (res.reactions) {
          this.appStore.setReactions(res.reactions);
        }
        this.loaded.set(true);
      },
      error: (err) => {
        this.loadingError.set(
          err?.error?.message || 'Failed to load discussion'
        );
        this.loaded.set(true);
      },
    });
  }

  onReplyAdded() {

  }
}
