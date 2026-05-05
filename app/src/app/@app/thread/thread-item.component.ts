import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MediaItem, Reaction, ReactionItem, Thread } from '@model/interfaces';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { RouterLink } from '@angular/router';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Icon } from '@ngstarter-ui/components/icon';
import { BookmarkButtonComponent } from '@app/bookmark-button/bookmark-button.component';
import { Button } from '@ngstarter-ui/components/button';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { ThreadService } from '@services/thread.service';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { ThreadNumberOfReplies } from '@app/thread-number-of-replies/thread-number-of-replies';
import { VideoPlayer } from '@ngstarter-ui/components/video-player';
import { Carousel, CarouselCard } from '@ngstarter-ui/components/carousel';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ThreadDialogService } from '@services/thread-dialog.service';
import { AppStore } from '@store/app.store';
import { ApiService } from '@services/api.service';
import { CommentLikesCountComponent } from '@app/comment-likes-count/comment-likes-count.component';
import { MarkdownComponent } from '@app/markdown/markdown.component';
import { ImageZoomViewer, ImageZoomViewerImage } from "@ngstarter-ui/components/image-zoom-viewer";
import { AddComplaintDirective } from "@directives/add-complaint.directive";
import { Menu, MenuItem, MenuTrigger } from "@ngstarter-ui/components/menu";
import { VideoViewerDirective, VideoViewerVideoDirective } from "@ngstarter-ui/components/video-viewer";
import { ThreadAdd } from "@app/thread-add/thread-add";

@Component({
  selector: 'app-thread-item',
  imports: [
    Dicebear,
    TimeAgoPipe,
    RouterLink,
    ImageProxyPipe,
    Icon,
    BookmarkButtonComponent,
    Button,
    ThreadNumberOfReplies,
    VideoPlayer,
    Carousel,
    CarouselCard,
    CommentLikesCountComponent,
    MarkdownComponent,
    TranslocoPipe,
    ImageZoomViewer,
    ImageZoomViewerImage,
    AddComplaintDirective,
    Menu,
    MenuItem,
    MenuTrigger,
    VideoViewerDirective,
    VideoViewerVideoDirective,
    ThreadAdd,
  ],
  templateUrl: './thread-item.component.html',
  styleUrl: './thread-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreadItemComponent implements OnInit {
  thread = input.required<Thread>();
  reactions = input<Reaction[] | ReactionItem[]>([]);
  depth = input<number>(0);
  nested = input(false, {
    transform: booleanAttribute
  });

  deleted = output<string>();
  replyAdded = output<void>();

  private _api = inject(ApiService);
  private _confirmManager = inject(ConfirmManager);
  private _threadService = inject(ThreadService);
  private _snack = inject(SnackBar);
  private _transloco = inject(TranslocoService);
  private _threadDialogService = inject(ThreadDialogService);
  private _appStore = inject(AppStore);
  private _destroyRef = inject(DestroyRef);
  private _ability = inject(Ability);

  hasReaction = computed(() => {
    const threadReactions = this.thread().reactions;
    const inputReactions = this.reactions() || [];
    const globalReactions = this._appStore.reactions() || [];

    // 1. Try finding in thread().reactions (highest priority for thread state)
    if (Array.isArray(threadReactions) && threadReactions.length > 0) {
      if ('reaction' in threadReactions[0]) {
        // It's ReactionItem[]
        const ri = (threadReactions as ReactionItem[]).find(ri => ri.reaction.type === 'like');
        if (ri) return ri.hasReaction;
      } else {
        // It's Reaction[]
        const foundR = (threadReactions as Reaction[]).find(r => r.type === 'like');
        if (foundR) return false;
      }
    }

    // 2. Try finding in input reactions
    if (inputReactions.length > 0) {
      if ('reaction' in inputReactions[0]) {
        // It's ReactionItem[]
        const foundRi = (inputReactions as unknown as ReactionItem[]).find(ri => ri.reaction.type === 'like');
        if (foundRi) return foundRi.hasReaction;
      } else {
        // It's Reaction[]
        const foundR = (inputReactions as Reaction[]).find(r => r.type === 'like');
        if (foundR) return false;
      }
    }

    // 3. Try finding in global store
    if (Array.isArray(globalReactions)) {
      const likeReaction = globalReactions.find(r => r.type === 'like');
      if (likeReaction) return false;
    }

    return false;
  });

  reactionItem = computed(() => {
    const threadReactions = this.thread().reactions;
    const inputReactions = this.reactions() || [];
    const globalReactions = this._appStore.reactions() || [];

    // 1. Try finding in thread().reactions (highest priority for thread state)
    if (Array.isArray(threadReactions) && threadReactions.length > 0) {
      if ('reaction' in threadReactions[0]) {
        // It's ReactionItem[]
        const ri = (threadReactions as ReactionItem[]).find(ri => ri.reaction.type === 'like');
        if (ri) return ri;
      } else {
        // It's Reaction[]
        const foundR = (threadReactions as Reaction[]).find(r => r.type === 'like');
        if (foundR) {
          return {
            reaction: foundR,
            totalCount: 0,
            hasReaction: false
          };
        }
      }
    }

    // 2. Try finding in input reactions
    if (inputReactions.length > 0) {
      if ('reaction' in inputReactions[0]) {
        // It's ReactionItem[]
        const foundRi = (inputReactions as unknown as ReactionItem[]).find(ri => ri.reaction.type === 'like');
        if (foundRi) return foundRi;
      } else {
        // It's Reaction[]
        const foundR = (inputReactions as Reaction[]).find(r => r.type === 'like');
        if (foundR) {
          return {
            reaction: foundR,
            totalCount: 0,
            hasReaction: false
          };
        }
      }
    }

    // 3. Try finding in global store
    if (Array.isArray(globalReactions)) {
      const likeReaction = globalReactions.find(r => r.type === 'like');
      if (likeReaction) {
        return {
          reaction: likeReaction,
          totalCount: 0,
          hasReaction: false
        };
      }
    }

    return undefined;
  });

  ngOnInit() {
    // console.log(this.thread().mediaItems);
  }

  toggleReaction(): void {
    if (!this._appStore.isLogged()) {
      this._snack.open(this._transloco.translate('auth.pleaseLogin'), 'OK', { duration: 3000 });
      return;
    }

    if (!this.reactionItem()) {
      this._snack.open(this._transloco.translate('thread.reactionNotFound'), 'OK', { duration: 3000 });
      return;
    }

    const currentHasReaction = this.hasReaction();
    const newHasReaction = !currentHasReaction;

    if (newHasReaction) {
      this.thread().reactionsCount += 1;
      const ri = this.reactionItem();
      if (ri) {
        ri.hasReaction = true;
      }
      this._api
        .post(`reaction/thread/${this.thread().id}/${this.reactionItem()!.reaction.id}`)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe();
    } else {
      this.thread().reactionsCount -= 1;
      const ri = this.reactionItem();
      if (ri) {
        ri.hasReaction = false;
      }
      this._api
        .delete(`reaction/thread/${this.thread().id}/${this.reactionItem()!.reaction.id}`)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe();
    }

    // Update the reaction item in the thread if possible
    // Since reactionItem is computed from thread(), and thread() is an input (object reference),
    // we can update the property on the object, and computed should re-evaluate if it's watching deeply or if we replace the object.
    // However, thread() is an input signal, changing properties inside the object won't trigger the signal unless the object reference changes.
    // Given the current architecture, we might need a local state if we want immediate UI update without re-fetching.
    // But the issue was the recursive tick during deletion.
  }

  canDelete = computed(() => {
    const profile = this._appStore.profile();
    if (!profile) {
      return false;
    }
    return profile.id === this.thread().author.id || this._ability.can(Action.Manage, 'all');
  });

  deleteThread() {
    const confirmDef = this._confirmManager.open({
      title: this._transloco.translate('thread.deleteTitle'),
      description: this._transloco.translate('thread.deleteDescription')
    });
    confirmDef.confirmed
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._threadService.delete(this.thread().id)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
            next: () => {
              this._snack.open(this._transloco.translate('thread.deleted'), 'OK', { duration: 3000 });
              // Use queueMicrotask to ensure we are out of the current change detection cycle
              // but still relatively fast.
              queueMicrotask(() => {
                this.deleted.emit(this.thread().id);
              });
            },
            error: () => {
              this._snack.open(this._transloco.translate('thread.failedToDelete'), 'OK', { duration: 3000 });
            }
          });
      });
  }

  onReplyClick() {
    this._threadDialogService.openReplyDialog(this.thread())
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.replyAdded.emit();
      });
  }

  onSent() {
    this.replyAdded.emit();
  }

  onCancel() {
    // Logic for cancellation if needed
  }

  getMediaImageSize(mediaItem: MediaItem, baseSize: number = 270): string {
    if (mediaItem.orientation === 'portrait') {
      return `${baseSize}x${Math.round(baseSize * 1.5)},q90`;
    }
    if (mediaItem.orientation === 'landscape') {
      return `${Math.round(baseSize * 1.5)}x${baseSize},q90`;
    }
    return `${baseSize}x${baseSize},q90`;
  }

  getScaledWidth(mediaItem: MediaItem, targetWidth: number): number | undefined {
    const width = mediaItem.payload?.width;
    const height = mediaItem.payload?.height;
    if (!width || !height) return width;

    if (mediaItem.orientation === 'portrait') {
      return targetWidth;
    }

    return width > targetWidth ? targetWidth : width;
  }

  getScaledHeight(mediaItem: MediaItem, targetWidth: number): number | undefined {
    const width = mediaItem.payload?.width;
    const height = mediaItem.payload?.height;
    const aspectRatio = mediaItem.payload?.aspectRatio;

    if (!width || !height) return height;

    const actualWidth = this.getScaledWidth(mediaItem, targetWidth) || width;

    if (aspectRatio) {
      return Math.round(actualWidth / aspectRatio);
    }

    return Math.round((actualWidth * height) / width);
  }
}
