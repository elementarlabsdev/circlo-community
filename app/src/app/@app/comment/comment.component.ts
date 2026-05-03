import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { Comment, ReactionItem } from '@model/interfaces';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { CommentEditorComponent } from '@app/comment-editor/comment-editor.component';
import { ApiService } from '@services/api.service';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { CommentLikesCountComponent } from '@app/comment-likes-count/comment-likes-count.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { AddComplaintDirective } from '@/@directives/add-complaint.directive';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { SafeHtmlPipe } from '@ngstarter-ui/components/core';

@Component({
  selector: 'app-comment',
  imports: [
    Dicebear,
    TimeAgoPipe,
    RouterLink,
    Button,
    Icon,
    Button,
    CommentEditorComponent,
    ImageProxyPipe,
    CommentLikesCountComponent,
    TranslocoPipe,
    AddComplaintDirective,
    Menu,
    MenuItem,
    MenuTrigger,
    SafeHtmlPipe
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss',
  host: {
    '[class.is-new]': 'isNew()'
  }
})
export class CommentComponent implements OnInit {
  private _api = inject(ApiService);

  comment = input.required<Comment>();
  targetId = input.required<string>();
  targetType = input.required<string>();
  threadCommentsDepth = input.required<number>();
  depth = input.required<number>();

  readonly replyAdded = output<void>();
  replyActive = signal(false);
  hasReaction = signal(false);
  reactionItem: ReactionItem;

  isNew = signal(false);

  get viewUrl() {
    return `/discussion/${this.comment().id}`;
  }

  ngOnInit() {
    this.isNew.set(this.comment().isNew || false);
    this.reactionItem = this.comment().reactions.find(reactionItem => reactionItem.reaction.type === 'like') as ReactionItem;

    if (this.reactionItem) {
      this.hasReaction.set(this.reactionItem.hasReaction);
    }

    if (this.isNew()) {
      setTimeout(() => {
        this.isNew.set(false);
      }, 10_000);
    }
  }

  reply(): void {
    this.replyActive.set(true);
  }

  onCancel(): void {
    this.replyActive.set(false);
  }

  toggleReaction(): void {
    this.hasReaction.update(v => !v);

    if (this.hasReaction()) {
      this.comment().reactionsCount += 1;
      this._api
        .post(`reaction/comment/${this.comment().id}/${this.reactionItem.reaction.id}`)
        .subscribe((res: any) => {
        });
    } else {
      this.comment().reactionsCount -= 1;
      this._api
        .delete(`reaction/comment/${this.comment().id}/${this.reactionItem.reaction.id}`)
        .subscribe((res: any) => {
        });
    }
  }

  onSent(content: string): void {
    this._api
      .post(`${this.targetType()}/comment/${this.comment().id}/reply`, {
        content
      })
      .subscribe((res: any) => {
        this.replyActive.set(false);
        this.replyAdded.emit();
      });
  }
}
