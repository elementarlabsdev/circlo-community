import { ChangeDetectorRef, Component, inject, OnInit, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from '@ngstarter/components/button';
import { FormField, Label, Suffix } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LogoComponent } from '@app/logo/logo.component';
import { AuthService } from '@services/auth.service';
import { ApiService } from '@services/api.service';
import { Divider } from '@ngstarter/components/divider';
import { AppStore } from '@store/app.store';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card } from '@ngstarter/components/card';
import { CaptchaService } from '@services/captcha.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    FormField,
    Label,
    Input,
    Suffix,
    Divider,
    ReactiveFormsModule,
    LogoComponent,
    TranslocoPipe,
    Card,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SigninComponent implements OnInit {
  private _appStore = inject(AppStore);
  private _formBuilder = inject(FormBuilder);
  private _api = inject(ApiService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _captcha = inject(CaptchaService);
  private cdr = inject(ChangeDetectorRef);
  readonly form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', [Validators.required]),
  });
  loading = signal(false);
  showAuthError = signal(false);
  showBlockedError = signal(false);
  showEmailVerificationError = signal(false);
  emailVerificationHash = signal('');
  oAuthEnabled = signal(false);
  registrationEnabled = signal(false);
  oAuthProviders = signal<any[]>([]);
  monetizationPaidAccountEnabled = signal(false);
  private _captchaConfig = computed(() => this._captcha.getCaptchaConfig());
  isRecaptcha = computed(() => this._captchaConfig()?.type === 'recaptcha');

  get siteName(): string {
    return this._appStore.siteName();
  }

  ngOnInit(): void {
    this._api.get('identity/page-settings/login').subscribe((res: any) => {
      this.oAuthEnabled.set(res.oAuthEnabled);
      this.registrationEnabled.set(res.registrationEnabled);
      this.oAuthProviders.set(res.oAuthProviders);
      this.monetizationPaidAccountEnabled.set(res.monetizationPaidAccountEnabled);
    });
  }

  async login() {
    this.loading.set(true);
    const captchaResult = await this._captcha.execute('login');

    if (!captchaResult) {
      this.loading.set(false);
      return;
    }

    const loginData: any = { ...this.form.value };
    this._captcha.injectToken(loginData, captchaResult);
    const consent = localStorage.getItem('cookie-consent');
    const preferences = localStorage.getItem('cookie-preferences');

    if (consent) {
      loginData.cookieConsent = consent === 'true';
    }

    if (preferences) {
      try {
        loginData.cookiePreferences = JSON.parse(preferences);
      } catch (e) {
        // ignore invalid JSON
      }
    }

    this._api
      .post('identity/login', loginData)
      .subscribe((res: any) => {
        this.showEmailVerificationError.set(false);
        this.showBlockedError.set(false);
        this.showAuthError.set(false);
        this._authService.login(res);
        this.cdr.detectChanges();

        if (res.isPaid === false) {
          this._router.navigateByUrl('/checkout');
        } else {
          this._router.navigateByUrl('/', { replaceUrl: true });
        }
      }, (httpError: any) => {
        const error = httpError?.error;

        if (error?.type) {
          if (error.type === 'accountNotVerified') {
            this.showEmailVerificationError.set(true);
            this.emailVerificationHash.set(error.hash);
          } else if (error.type === 'accountBlocked') {
            this.showBlockedError.set(true);
          } else if (error.type === 'invalidCredentials') {
            this.showAuthError.set(true);
          }
        } else {
          this.showAuthError.set(true);
        }

        this.loading.set(false);
      })
    ;
  }

  oAuthLoginBy(type: string) {
    location.href = this._api.getApiEndpoint() + 'oauth/' + type;
  }
}
