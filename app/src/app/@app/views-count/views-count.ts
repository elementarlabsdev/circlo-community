import { Component, input, numberAttribute } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-views-count',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './views-count.html',
  styleUrl: './views-count.scss',
})
export class ViewsCount {
  count = input.required({
    transform: numberAttribute
  });
}
