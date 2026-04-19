import { Component, input, OnInit } from '@angular/core';
import { Ripple } from '@ngstarter/components/core';
import { RouterLink } from '@angular/router';
import { Widget } from '@model/interfaces';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-recommended-topics',
  standalone: true,
  imports: [
    Ripple,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './recommended-topics.widget.html',
  styleUrl: './recommended-topics.widget.scss'
})
export class RecommendedTopicsWidget {
  widget = input.required<Widget>();
}
