import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { PasswordStrength } from '@ngstarter/components/password-strength';
import { LogoComponent } from '@app/logo/logo.component';
import { ApiService } from '@services/api.service';
import { passwordMatchValidator } from '@/@validators/password-match.validator';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card } from '@ngstarter/components/card';
import { CaptchaService } from '@services/captcha.service';

 @Component({
   imports: [
     RouterLink,
     FormsModule,
     Button,
     FormField,
     Input,
     Label,
     ReactiveFormsModule,
     PasswordStrength,
     LogoComponent,
     TranslocoPipe,
     Card
   ],
   templateUrl: './set-new-password.component.html',
   styleUrl: './set-new-password.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush,
 })
 export class SetNewPasswordComponent {
   private _route = inject(ActivatedRoute);
   private _router = inject(Router);
   private _api = inject(ApiService);
   private _captcha = inject(CaptchaService);
   showError = signal(false);
   loading = signal(false);
   private _captchaConfig = computed(() => this._captcha.getCaptchaConfig());
   isRecaptcha = computed(() => this._captchaConfig()?.type === 'recaptcha');

  form = new FormGroup({
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, {
    validators: [passwordMatchValidator()]
  });

  ngOnInit() {
    this._api
      .get(`identity/set-new-password/${this._route.snapshot.params['hash']}`)
      .subscribe((res: any) => {

      });
  }

  get passwordValue(): string {
    return this.form.get('password')?.value as string;
  }

  async resetPassword() {
    this.loading.set(true);
    this.showError.set(false);

    const captchaResult = await this._captcha.execute('set_new_password');

    if (!captchaResult) {
      this.loading.set(false);
      return;
    }

    const data = { ...this.form.value };
    this._captcha.injectToken(data, captchaResult);

    this._api
      .post(`identity/set-new-password/${this._route.snapshot.params['hash']}`, data)
      .subscribe({
        next: (res: any) => {
          this.loading.set(false);
          if (res.valid) {
            this._router.navigate(['/password-restored']);
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
