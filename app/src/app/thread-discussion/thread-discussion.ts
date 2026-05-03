import { Component, inject, signal, PLATFORM_ID, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { isPlatformBrowser } from '@angular/common';
import { ThreadComponent } from '@app/thread/thread.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Thread } from '@model/interfaces';
import findRecursive from '@/_utils/find-recursive';
import { WebSocketService } from '@services/web-socket.service';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';
import { AppStore } from '@store/app.store';

@Component({
  selector: 'app-thread-discussion',
  standalone: true,
  imports: [ThreadComponent, RouterLink, Icon, Button],
  templateUrl: './thread-discussion.html',
  styleUrl: './thread-discussion.scss',
})
export class ThreadDiscussion {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  private webSocket = inject(WebSocketService);
  private destroyRef = inject(DestroyRef);
  private appStore = inject(AppStore);

  loaded = signal(false);
  loadingError = signal<string | null>(null);
  rootThread = signal<Thread | null>(null);
  depth = signal<number>(0);

  nestedRepliesCount(): number {
    const t: any = this.rootThread();
    return typeof t?.nestedRepliesCount === 'number' ? t.nestedRepliesCount : 0;
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetch(id);
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.webSocket
        .listen<any>('addThreadReply')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(payload => {
          this._onReplyAdded(payload.reply);
        });
    }
  }

  private _onReplyAdded(reply: Thread) {
    const root = this.rootThread();
    if (!root) return;

    if (reply.respondingToId === root.id) {
      this.rootThread.update(t => {
        if (!t) return null;
        const replies = t.replies || [];
        if (replies.some(r => r.id === reply.id)) return t;
        return {
          ...t,
          replies: [reply, ...replies],
          repliesCount: (t.repliesCount || 0) + 1,
          nestedRepliesCount: (t.nestedRepliesCount || 0) + 1
        };
      });
      return;
    }

    const parent = findRecursive(root.replies || [], (r: any) => r.id === reply.respondingToId, 'replies');
    if (parent) {
      this.rootThread.update(t => {
        if (!t) return null;
        this._addReplyRecursive(t, reply);
        return { ...t, nestedRepliesCount: (t.nestedRepliesCount || 0) + 1 };
      });
    }
  }

  private _addReplyRecursive(current: Thread, reply: Thread): boolean {
    if (current.id === reply.respondingToId) {
      const replies = current.replies || [];
      if (replies.some(r => r.id === reply.id)) return false;
      current.replies = [reply, ...replies];
      current.repliesCount = (current.repliesCount || 0) + 1;
      return true;
    }

    if (current.replies) {
      for (const r of current.replies) {
        if (this._addReplyRecursive(r, reply)) return true;
      }
    }
    return false;
  }

  onThreadDeleted(id: string) {
    if (this.rootThread()?.id === id) {
      this.router.navigate(['/']);
    } else {
      this.rootThread.update(t => {
        if (!t) return null;
        this._removeReplyRecursive(t, id);
        const newCount = this._countNestedReplies(t);
        return { ...t, nestedRepliesCount: newCount };
      });
    }
  }

  private _removeReplyRecursive(current: Thread, id: string): boolean {
    if (!current.replies) return false;

    const index = current.replies.findIndex(r => r.id === id);
    if (index !== -1) {
      current.replies.splice(index, 1);
      current.repliesCount = (current.repliesCount || 1) - 1;
      return true;
    }

    for (const r of current.replies) {
      if (this._removeReplyRecursive(r, id)) return true;
    }

    return false;
  }

  private _countNestedReplies(thread: Thread): number {
    let count = thread.replies?.length || 0;
    if (thread.replies) {
      for (const r of thread.replies) {
        count += this._countNestedReplies(r);
      }
    }
    return count;
  }

  fetch(id: string) {
    this.loaded.set(false);
    this.loadingError.set(null);
    this.api.get(`threads/${id}/discussion`, { cache: false }).subscribe({
      next: (res: any) => {
        this.rootThread.set(res.comment);
        if (res.reactions) {
          this.appStore.setReactions(res.reactions);
        }
        this.loaded.set(true);
      },
      error: (err) => {
        this.loadingError.set(
          err?.error?.message || 'Failed to load thread'
        );
        this.loaded.set(true);
      },
    });
  }
}
