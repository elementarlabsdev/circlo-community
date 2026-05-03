import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { PinInput } from '@ngstarter-ui/components/pin-input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LogoComponent } from '@app/logo/logo.component';
import { ApiService } from '@services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card } from '@ngstarter-ui/components/card';

@Component({
  imports: [
    FormsModule,
    Button,
    Icon,
    PinInput,
    ReactiveFormsModule,
    RouterLink,
    LogoComponent,
    TranslocoPipe,
    Card
  ],
  templateUrl: './password-verification.component.html',
  styleUrl: './password-verification.component.scss'
})
export class PasswordVerificationComponent {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _destroyRef = inject(DestroyRef);
  loaded = signal(false);
  loading = signal(false);
  showError = signal(false);
  email = signal('');

  form = this._formBuilder.group({
    code: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6)
      ]
    ],
  });

  ngOnInit() {
    this._api
      .get(`identity/password-verification/${this._route.snapshot.params['hash']}`)
      .subscribe((res: any) => {
        this.email.set(res.email);
      });
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.showError.set(false);
      });
  }

  resendCode() {
    this.loading.set(true);
    const currentHash = this._route.snapshot.params['hash'];
    this._api
      .post(`identity/password-verification/${currentHash}/resend`, {})
      .subscribe({
        next: (res: any) => {
          const newHash = res.hash;
          this._router.navigate(['password-verification', newHash]);
          this.showError.set(false);
          this.loading.set(false);
        },
        error: (err) => {
          console.warn('Resend error', err?.error || err);
          this.loading.set(false);
        }
      });
  }

  check() {
    this.loading.set(true);
    this._api
      .post(`identity/password-verification/${this._route.snapshot.params['hash']}`, this.form.value)
      .subscribe((res: any) => {
        if (res.valid) {
          this._router.navigate(['set-new-password', this._route.snapshot.params['hash']]);
        } else {
          this.showError.set(true);
          this.loading.set(false);
        }
      });
  }
}
