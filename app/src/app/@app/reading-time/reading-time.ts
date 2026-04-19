import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-reading-time',
  imports: [
    TranslocoPipe
  ],
  templateUrl: './reading-time.html',
  styleUrl: './reading-time.scss',
})
export class ReadingTime {
  readingTime = input.required<any>();
}
