import { Component, DestroyRef, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { PinInput } from '@ngstarter/components/pin-input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LogoComponent } from '@app/logo/logo.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card } from '@ngstarter/components/card';
import { CaptchaService } from '@services/captcha.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-email-verification',
  imports: [
    FormsModule,
    Button,
    Icon,
    ReactiveFormsModule,
    RouterLink,
    PinInput,
    LogoComponent,
    TranslocoPipe,
    Card,
  ],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailVerificationComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _destroyRef = inject(DestroyRef);
  private _snackBar = inject(SnackBar);
  private _captcha = inject(CaptchaService);
  private _authService = inject(AuthService);
  loaded = signal(false);
  loading = signal(false);
  showError = signal(false);
  email = '';
  private _captchaConfig = computed(() => this._captcha.getCaptchaConfig());
  isRecaptcha = computed(() => this._captchaConfig()?.type === 'recaptcha');

  form = this._formBuilder.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  ngOnInit() {
    this._api
      .get(`email/${this._route.snapshot.params['hash']}/verification`)
      .subscribe((res: any) => {
        this.email = res.email;
      })
    ;
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.showError.set(false);
      });
  }

  async resendCode() {
    this.loading.set(true);

    const captchaResult = await this._captcha.execute('resend_verification');

    if (!captchaResult) {
      this.loading.set(false);
      return;
    }

    const data = {};
    this._captcha.injectToken(data, captchaResult);

    this._api
      .post(`email/${this._route.snapshot.params['hash']}/verification/resend`, data)
      .subscribe({
        next: (res: any) => {
          const newHash = res?.hash;
          if (newHash) {
            this.form.reset();
            this.showError.set(false);
            this._router.navigate(['/', 'email', newHash, 'verification']).then(() => {
              this._api
                .get(`email/${newHash}/verification`)
                .subscribe((r: any) => {
                  this.email = r?.email || this.email;
                  this.loading.set(false);
                });
            });
          } else {
            this.loading.set(false);
          }
        },
        error: (e: any) => {
          this.loading.set(false);
          const retryAt = e?.error?.retryAt;
          const reason = e?.error?.reason;
          if (retryAt) {
            const ra = new Date(retryAt);
            const diffMs = ra.getTime() - Date.now();
            const minutes = Math.max(1, Math.ceil(diffMs / 60000));
            if (reason === 'blocked') {
              this._snackBar.open(`Resending is blocked. Try again in ~${minutes} min.`, 'OK', { duration: 5000 });
            } else if (reason === 'limit') {
              this._snackBar.open(`Send limit exceeded. Try again in ~${minutes} min.`, 'OK', { duration: 5000 });
            } else {
              this._snackBar.open(`Too early. Try again in ~${minutes} min.`, 'OK', { duration: 5000 });
            }
          } else {
            this._snackBar.open('Failed to send the code. Please try again later.', 'OK', { duration: 5000 });
          }
        }
      });
  }

  async check() {
    this.loading.set(true);

    const captchaResult = await this._captcha.execute('check_verification');

    if (!captchaResult) {
      this.loading.set(false);
      return;
    }

    const data = { ...this.form.value };
    this._captcha.injectToken(data, captchaResult);

    this._api
      .post(`email/${this._route.snapshot.params['hash']}/verification`, data)
      .subscribe((res: any) => {
        if (res.valid) {
          this._authService.login(res);
          this._router.navigate(['/']);
        } else {
          this.showError.set(true);
          this.loading.set(false);
        }
      });
  }
}
