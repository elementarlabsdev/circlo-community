import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { Divider } from '@ngstarter/components/divider';

@Component({
  selector: 'app-checkout-cancel',
  imports: [
    CommonModule,
    RouterModule,
    TranslocoPipe,
    Divider
  ],
  templateUrl: './cancel.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutCancelComponent {}
