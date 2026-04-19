import { Component, inject, input, output } from '@angular/core';
import { Reaction, Thread } from '@model/interfaces';
import { ThreadItemComponent } from './thread-item.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    ThreadItemComponent
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  thread = input.required<Thread>();
  reactions = input<Reaction[]>([]);
  depth = input<number>(0);
  deleted = output<string>();
  replyAdded = output<void>();
}
