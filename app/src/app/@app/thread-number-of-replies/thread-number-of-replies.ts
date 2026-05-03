import { Component, input, numberAttribute } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-thread-number-of-replies',
  imports: [
    Icon,
    Button,
  ],
  templateUrl: './thread-number-of-replies.html',
  styleUrl: './thread-number-of-replies.scss',
})
export class ThreadNumberOfReplies {
  count = input.required({
    transform: numberAttribute
  });
}
