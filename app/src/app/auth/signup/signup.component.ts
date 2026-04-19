import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LogoComponent } from '@app/logo/logo.component';
import { ApiService } from '@services/api.service';
import { CaptchaService } from '@services/captcha.service';
import { Divider } from '@ngstarter/components/divider';
import { ColorSchemeStore } from '@ngstarter/components/color-scheme';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card } from '@ngstarter/components/card';

@Component({
  standalone: true,
  imports: [
    Button,
    FormField,
    Input,
    Label,
    RouterLink,
    ReactiveFormsModule,
    Divider,
    LogoComponent,
    TranslocoPipe,
    Card,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent implements OnInit {
  private colorSchemeStore = inject(ColorSchemeStore);
  private _formBuilder = inject(FormBuilder);
  private _api = inject(ApiService);
  private _router = inject(Router);
  private _captcha = inject(CaptchaService);
  readonly form = this._formBuilder.group({
    name: this._formBuilder.control('', [Validators.required]),
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', [Validators.required]),
    preferredColorScheme: [this.colorSchemeStore.theme(), [Validators.required]],
  });
  loading = signal(false);
  showEmailTakenError = signal(false);
  imageUrl = signal('');
  oAuthEnabled = signal(false);
  oAuthProviders = signal<any[]>([]);
  globalError = signal<any>(null);
  private _captchaConfig = computed(() => this._captcha.getCaptchaConfig());
  isRecaptcha = computed(() => this._captchaConfig()?.type === 'recaptcha');

  ngOnInit(): void {
    this._api.get('identity/page-settings/register').subscribe((res: any) => {
      this.oAuthEnabled.set(res.oAuthEnabled);
      this.oAuthProviders.set(res.oAuthProviders);
    });
  }

  async register() {
    this.showEmailTakenError.set(false);
    this.loading.set(true);
    this.globalError.set(null);

    const captchaResult = await this._captcha.execute();

    if (!captchaResult) {
      this.loading.set(false);
      return;
    }

    const registerData: any = { ...this.form.value };

    this._captcha.injectToken(registerData, captchaResult);

    const consent = localStorage.getItem('cookie-consent');
    const preferences = localStorage.getItem('cookie-preferences');

    if (consent) {
      registerData.cookieConsent = consent === 'true';
    }

    if (preferences) {
      try {
        registerData.cookiePreferences = JSON.parse(preferences);
      } catch (e) {
        // ignore invalid JSON
      }
    }

    this._api
      .post('identity/register', registerData)
      .subscribe((res: any) => {
        if (res.hash) {
          this._router.navigateByUrl(`/email/${res.hash}/verification`);
        } else {
          this._router.navigateByUrl('/login');
        }
      }, (httpError: any) => {
        const error = httpError.error;

        if (error.type) {
          if (error.type === 'emailAlreadyInUse') {
            this.showEmailTakenError.set(true);
          }
        } else {
          if (typeof error.message === 'string') {
            error.message = [error.message];
          }

          this.globalError.set(error);
        }

        this.loading.set(false);
      })
    ;
  }

  oAuthRegisterBy(type: string) {
    location.href = this._api.getApiEndpoint() + 'oauth/' + type;
  }
}
