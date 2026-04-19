import { Component, input, numberAttribute } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-comments-count',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './comments-count.component.html',
  styleUrl: './comments-count.component.scss'
})
export class CommentsCountComponent {
  count = input.required({
    transform: numberAttribute
  });
}
