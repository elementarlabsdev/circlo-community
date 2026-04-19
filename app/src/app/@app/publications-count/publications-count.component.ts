import { Component, input, numberAttribute } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-publications-count',
  standalone: true,
  imports: [
    TranslocoPipe
  ],
  templateUrl: './publications-count.component.html',
  styleUrl: './publications-count.component.scss'
})
export class PublicationsCountComponent {
  count = input.required({
    transform: numberAttribute
  });
}
