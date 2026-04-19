import { Component } from '@angular/core';
import { LayoutSlotComponent } from '@app/layout-slot/layout-slot.component';

@Component({
  selector: 'app-home-aside',
  standalone: true,
  imports: [
    LayoutSlotComponent
  ],
  templateUrl: './home-aside.component.html',
  styleUrl: './home-aside.component.scss'
})
export class HomeAsideComponent {
}
