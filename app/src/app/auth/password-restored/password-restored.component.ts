import { Component, inject, signal } from '@angular/core';
import {  Button } from '@ngstarter/components/button';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '@app/logo/logo.component';
import { ApiService } from '@services/api.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card } from '@ngstarter/components/card';

@Component({
  selector: 'app-password-restored',
  imports: [
    RouterLink,
    LogoComponent,
    TranslocoPipe,
    Button,
    Card
  ],
  templateUrl: './password-restored.component.html',
  styleUrl: './password-restored.component.scss'
})
export class PasswordRestoredComponent {
  private _api = inject(ApiService);
  imageUrl = signal('');

  ngOnInit() {
    this._api.get('identity/password-restored').subscribe((res: any) => {
      this.imageUrl.set(res.imageUrl);
    });
  }
}
