import { Component, input } from '@angular/core';
import { Widget } from '@model/interfaces';

@Component({
  selector: 'app-social-media-links',
  imports: [],
  templateUrl: './social-media-links.widget.html',
  styleUrl: './social-media-links.widget.scss'
})
export class SocialMediaLinksWidget {
  widget = input.required<Widget>();
}
