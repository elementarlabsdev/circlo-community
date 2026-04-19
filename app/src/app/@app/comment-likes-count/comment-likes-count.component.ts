import { Component, input, numberAttribute } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-comment-likes-count',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './comment-likes-count.component.html',
  styleUrl: './comment-likes-count.component.scss'
})
export class CommentLikesCountComponent {
  count = input.required({
    transform: numberAttribute
  });
}
