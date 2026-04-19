import { Component, input, numberAttribute } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-user-followers-count',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './user-followers-count.html',
  styleUrl: './user-followers-count.scss',
})
export class UserFollowersCount {
  count = input.required({
    transform: numberAttribute
  });
}
