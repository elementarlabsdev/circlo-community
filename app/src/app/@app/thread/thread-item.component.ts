import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
  untracked
} from '@angular/core';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Reaction, ReactionItem, Thread } from '@model/interfaces';
import { Dicebear } from '@ngstarter/components/avatar';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { RouterLink } from '@angular/router';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip } from '@ngstarter/components/tooltip';
import { BookmarkButtonComponent } from '@app/bookmark-button/bookmark-button.component';
import { Button } from '@ngstarter/components/button';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { ThreadService } from '@services/thread.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { ThreadNumberOfReplies } from '@app/thread-number-of-replies/thread-number-of-replies';
import { VideoPlayer } from '@ngstarter/components/video-player';
import { Carousel, CarouselCard } from '@ngstarter/components/carousel';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ThreadDialogService } from '@services/thread-dialog.service';
import { AppStore } from '@store/app.store';
import { ApiService } from '@services/api.service';
import { CommentLikesCountComponent } from '@app/comment-likes-count/comment-likes-count.component';
import { MarkdownComponent } from '@app/markdown/markdown.component';
import {ImageZoomViewer, ImageZoomViewerImage} from "@ngstarter/components/image-zoom-viewer";
import {AddComplaintDirective} from "@directives/add-complaint.directive";
import {Menu, MenuItem, MenuTrigger} from "@ngstarter/components/menu";
import {VideoViewerDirective, VideoViewerVideoDirective} from "@ngstarter/components/video-viewer";

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
    Tooltip,
    TranslocoPipe,
    ImageZoomViewer,
    ImageZoomViewerImage,
    AddComplaintDirective,
    Menu,
    MenuItem,
    MenuTrigger,
    VideoViewerDirective,
    VideoViewerVideoDirective,
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

  hasReaction = signal(false);
  reactionItem: ReactionItem | undefined;

  constructor() {
    effect(() => {
      this.thread();
      this.reactions();
      this._appStore.reactions();
      untracked(() => {
        this._initializeReactions();
      });
    });
  }

  ngOnInit() {
  }

  private _initializeReactions() {
    const threadReactions = this.thread().reactions;
    const inputReactions = this.reactions() || [];
    const globalReactions = this._appStore.reactions() || [];

    // 1. Try finding in thread().reactions (highest priority for thread state)
    if (Array.isArray(threadReactions) && threadReactions.length > 0) {
      if ('reaction' in threadReactions[0]) {
        // It's ReactionItem[]
        this.reactionItem = (threadReactions as ReactionItem[]).find(ri => ri.reaction.type === 'like');
      } else {
        // It's Reaction[]
        const foundR = (threadReactions as Reaction[]).find(r => r.type === 'like');
        if (foundR) {
          this.reactionItem = {
            reaction: foundR,
            totalCount: 0,
            hasReaction: false
          };
        }
      }
    }

    if (this.reactionItem) {
      this.hasReaction.set(this.reactionItem.hasReaction);
      return;
    }

    // 2. Try finding in input reactions
    if (inputReactions.length > 0) {
      if ('reaction' in inputReactions[0]) {
        // It's ReactionItem[]
        const foundRi = (inputReactions as unknown as ReactionItem[]).find(ri => ri.reaction.type === 'like');
        if (foundRi) {
          this.reactionItem = foundRi;
          this.hasReaction.set(foundRi.hasReaction);
          return;
        }
      } else {
        // It's Reaction[]
        const foundR = (inputReactions as Reaction[]).find(r => r.type === 'like');
        if (foundR) {
          this.reactionItem = {
            reaction: foundR,
            totalCount: 0,
            hasReaction: false
          };
          this.hasReaction.set(false);
          return;
        }
      }
    }

    // 3. Try finding in global store
    if (Array.isArray(globalReactions)) {
      const likeReaction = globalReactions.find(r => r.type === 'like');
      if (likeReaction) {
        this.reactionItem = {
          reaction: likeReaction,
          totalCount: 0,
          hasReaction: false
        };
        this.hasReaction.set(false);
      }
    }
  }

  toggleReaction(): void {
    if (!this._appStore.isLogged()) {
      this._snack.open(this._transloco.translate('auth.pleaseLogin'), 'OK', { duration: 3000 });
      return;
    }

    if (!this.reactionItem) {
      this._snack.open(this._transloco.translate('thread.reactionNotFound'), 'OK', { duration: 3000 });
      return;
    }

    const currentHasReaction = this.hasReaction();
    this.hasReaction.set(!currentHasReaction);

    if (this.hasReaction()) {
      this.thread().reactionsCount += 1;
      this._api
        .post(`reaction/thread/${this.thread().id}/${this.reactionItem.reaction.id}`)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe();
    } else {
      this.thread().reactionsCount -= 1;
      this._api
        .delete(`reaction/thread/${this.thread().id}/${this.reactionItem.reaction.id}`)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe();
    }
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
              this.deleted.emit(this.thread().id);
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
}
