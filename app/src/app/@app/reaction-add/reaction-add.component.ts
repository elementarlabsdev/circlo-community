import { Component, inject, input, output, computed } from '@angular/core';
import { ReactionItem } from '@model/interfaces';
import { Ripple } from '@ngstarter-ui/components/core';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { ApiService } from '@services/api.service';
import { LoginGuardComponent } from '@app/login-guard/login-guard.component';
import { AppStore } from '@store/app.store';

@Component({
  selector: 'app-reaction-add',
  standalone: true,
  imports: [
    Ripple,
    Tooltip,
    LoginGuardComponent
  ],
  templateUrl: './reaction-add.component.html',
  styleUrl: './reaction-add.component.scss'
})
export class ReactionAddComponent {
  private _api = inject(ApiService);
  private _appStore = inject(AppStore);

  reactions = input.required<ReactionItem[]>();
  list = computed(() => {
    const reactions = this.reactions();
    if (Array.isArray(reactions) && reactions.length > 0) {
      return reactions;
    }
    const globalReactions = this._appStore.reactions();
    if (Array.isArray(globalReactions) && globalReactions.length > 0) {
      return globalReactions.map(r => ({
        ...r,
        totalCount: 0,
        hasReaction: false
      }));
    }
    return [];
  });
  targetId = input.required<string>();
  targetType = input.required<string>();
  reactionAdded = output();
  reactionDeleted = output();

  toggleReaction(item: ReactionItem) {
    item.hasReaction = !item.hasReaction;

    if (item.hasReaction) {
      item.totalCount += 1;
      this.reactionAdded.emit();
      this._api
        .post(`reaction/${this.targetType()}/${this.targetId()}/${item.reaction.id}`)
        .subscribe((res: any) => {
        });
    } else {
      item.totalCount -= 1;
      this.reactionDeleted.emit();
      this._api
        .delete(`reaction/${this.targetType()}/${this.targetId()}/${item.reaction.id}`)
        .subscribe((res: any) => {
        });
    }
  }
}
