import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  untracked,
  PLATFORM_ID,
  signal,
  OnChanges,
  SimpleChanges
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
export class FeedItems implements OnChanges {
  private webSocket = inject(WebSocketService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  items = input.required<any[]>();
  reactions = input.required<any>();

  deleted = output<{ targetId: string, targetType: string }>();

  displayItems = signal<any[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.webSocket.listen('removeFeedItem')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((params: any) => {
          this.displayItems.update(items => {
            const filtered = items.filter(item =>
              !(item.targetType === params.targetType && String(item.targetId) === String(params.targetId))
            );
            return filtered;
          });
          this.deleted.emit(params);
        });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.displayItems.set(this.items());
    }
  }

  onItemDeleted(targetId: string, targetType: string) {
    this.displayItems.update(items => {
      const filtered = items.filter(item =>
        !(item.targetType === targetType && String(item.targetId) === String(targetId))
      );
      return filtered;
    });
    this.deleted.emit({ targetId: String(targetId), targetType });
  }

  onReplyAdded(thread: Thread) {
    thread.repliesCount++;
  }
}
