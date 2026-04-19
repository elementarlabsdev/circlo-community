import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '@app/logo/logo.component';
import { ApiService } from '@services/api.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card } from '@ngstarter/components/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-verified',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    Card,
    LogoComponent,
    TranslocoPipe
  ],
  templateUrl: './email-verified.component.html',
  styleUrl: './email-verified.component.scss'
})
export class EmailVerifiedComponent implements OnInit {
  private _api = inject(ApiService);
  imageUrl = signal('');

  async ngOnInit() {
    this._api.get('email-verified').subscribe((res: any) => {
      this.imageUrl.set(res.imageUrl);
    });
  }
}
