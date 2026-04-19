import { Component, input } from '@angular/core';
import { Channel, TutorialInterface } from '@model/interfaces';

@Component({
  selector: 'app-tutorial',
  imports: [],
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.scss'
})
export class Tutorial {
  tutorial = input.required<TutorialInterface>();
  reactions = input.required<any>();

  get channel(): Channel | null {
    return this.tutorial().channel;
  }
}
