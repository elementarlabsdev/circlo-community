import { Component } from '@angular/core';
import { HeaderComponent } from '@app/header/header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet
  ],
  templateUrl: './common.component.html',
  styleUrl: './common.component.scss'
})
export class CommonComponent {

}
