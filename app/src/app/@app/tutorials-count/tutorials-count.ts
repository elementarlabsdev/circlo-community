import { Component, input, numberAttribute } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-tutorials-count',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './tutorials-count.html',
  styleUrl: './tutorials-count.scss',
})
export class TutorialsCount {
  count = input.required({
    transform: numberAttribute
  });
}
