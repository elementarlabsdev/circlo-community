import { Component, input } from '@angular/core';
import { ReactionItem } from '@model/interfaces';

@Component({
  selector: 'app-reaction-list',
  standalone: true,
  imports: [],
  templateUrl: './reaction-list.component.html',
  styleUrl: './reaction-list.component.scss'
})
export class ReactionListComponent {
  reactions = input.required<ReactionItem[] | any>();
  size = input<'small'|'large'>('small');

  get activeReactions(): ReactionItem[] {
    const reactions = this.reactions();
    if (!Array.isArray(reactions)) {
      return [];
    }
    return reactions.filter(reactionItem => reactionItem.totalCount > 0);
  }
}
