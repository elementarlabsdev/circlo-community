import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  untracked,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { PublicationComponent } from '@app/publication/publication.component';
import { TutorialPreview } from '@app/tutorial-preview/tutorial-preview';
import { ThreadComponent } from '@app/thread/thread.component';
import { WebSocketService } from '@services/web-socket.service';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Thread } from '@model/interfaces';

@Component({
  selector: 'app-feed-items',
  standalone: true,
  imports: [
    PublicationComponent,
    TutorialPreview,
    ThreadComponent
  ],
  templateUrl: './feed-items.html',
  styleUrl: './feed-items.scss',
})
export class FeedItems {
  private webSocket = inject(WebSocketService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  items = input.required<any[]>();
  reactions = input.required<any>();

  deleted = output<{ targetId: string, targetType: string }>();

  displayItems = signal<any[]>([]);

  constructor() {
    effect(() => {
      const items = this.items();
      untracked(() => {
        console.log('FeedItems: items updated from input', items.length);
        this.displayItems.set(items);
      });
    });

    if (isPlatformBrowser(this.platformId)) {
      this.webSocket.listen('removeFeedItem')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((params: any) => {
          console.log('FeedItems: WebSocket removeFeedItem', params);
          this.displayItems.update(items => {
            const filtered = items.filter(item =>
              !(item.targetType === params.targetType && String(item.targetId) === String(params.targetId))
            );
            console.log('FeedItems: WS displayItems count before:', items.length, 'after:', filtered.length);
            return filtered;
          });
          this.deleted.emit(params);
        });
    }
  }

  onItemDeleted(targetId: string, targetType: string) {
    console.log('FeedItems: onItemDeleted', { targetId, targetType });
    this.displayItems.update(items => {
      const filtered = items.filter(item =>
        !(item.targetType === targetType && String(item.targetId) === String(targetId))
      );
      console.log('FeedItems: displayItems count before:', items.length, 'after:', filtered.length);
      return filtered;
    });
    this.deleted.emit({ targetId: String(targetId), targetType });
  }

  onReplyAdded(thread: Thread) {
    thread.repliesCount++;
  }
}
