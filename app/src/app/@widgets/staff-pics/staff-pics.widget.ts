import { Component, input } from '@angular/core';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { RouterLink } from '@angular/router';
import { Widget } from '@model/interfaces';
import { ImageProxyPipe } from '../../pipes/image-proxy.pipe';

@Component({
  selector: 'app-staff-pics',
  standalone: true,
  imports: [
    Dicebear,
    RouterLink,
    ImageProxyPipe
  ],
  templateUrl: './staff-pics.widget.html',
  styleUrl: './staff-pics.widget.scss'
})
export class StaffPicsWidget {
  widget = input.required<Widget>();
}
