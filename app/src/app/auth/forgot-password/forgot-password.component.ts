import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LogoComponent } from '@app/logo/logo.component';
import { ApiService } from '@services/api.service';
import { AppStore } from '@store/app.store';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card } from '@ngstarter-ui/components/card';
import { CaptchaService } from '@services/captcha.service';

@Component({
  imports: [
    Button,
    FormField,
    Input,
    Label,
    RouterLink,
    ReactiveFormsModule,
    LogoComponent,
    TranslocoPipe,
    Card,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent implements OnInit {
  private _appStore = inject(AppStore);
  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _api = inject(ApiService);
  private _captcha = inject(CaptchaService);
  form = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });
  showError = signal(false);
  loading = signal(false);
  private _captchaConfig = computed(() => this._captcha.getCaptchaConfig());
  isRecaptcha = computed(() => this._captchaConfig()?.type === 'recaptcha');

  get siteName(): string {
    return this._appStore.siteName();
  }

  ngOnInit() {
    this._api.get('identity/forgot-password').subscribe((res: any) => {
    });
  }

  async resetPassword() {
    this.loading.set(true);
    this.showError.set(false);

    const captchaResult = await this._captcha.execute('forgot_password');

    if (!captchaResult) {
      this.loading.set(false);
      return;
    }

    const data = { ...this.form.value };
    this._captcha.injectToken(data, captchaResult);

    this._api
      .post('identity/forgot-password', data)
      .subscribe({
        next: (res: any) => {
          this.loading.set(false);
          if (res.valid) {
            if (res.verified) {
              this._router.navigate(['/set-new-password', res.hash]);
            } else {
              this._router.navigate(['/password-verification', res.hash]);
            }
          } else {
            this.showError.set(true);
          }
        },
        error: () => {
          this.loading.set(false);
          this.showError.set(true);
        }
      });
  }
}
