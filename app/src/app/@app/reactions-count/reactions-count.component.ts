import { Component, input, numberAttribute } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-reactions-count',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './reactions-count.component.html',
  styleUrl: './reactions-count.component.scss'
})
export class ReactionsCountComponent {
  count = input.required({
    transform: numberAttribute
  });
}
