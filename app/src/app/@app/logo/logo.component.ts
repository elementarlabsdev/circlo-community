import { Component, inject } from '@angular/core';
import { AppStore } from '@store/app.store';
import { ImageProxyPipe } from '../../pipes/image-proxy.pipe';

@Component({
  selector: 'app-logo',
  standalone: true,
  templateUrl: './logo.component.html',
  imports: [
    ImageProxyPipe
  ],
  styleUrl: './logo.component.scss'
})
export class LogoComponent {
  readonly appStore = inject(AppStore);
}
