import { EventEmitter, inject, Injectable } from '@angular/core';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { LoginDto } from '@model/interfaces';
import { AppStore } from '@store/app.store';
import { environment } from '../../environments/environment';
import { AUTH_TOKEN_NAME } from '@/types';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _cookieService = inject(SsrCookieService);
  private _appStore = inject(AppStore);
  private _router = inject(Router);

  readonly loggedChange = new EventEmitter<boolean>();

  isLogged(): boolean {
    return this._appStore.isLogged();
  }

  login(loginDto: LoginDto): void {
    this._appStore.setIsLogged(true);
    this._appStore.setProfile(loginDto);
    this._appStore.setRules(loginDto.rules || []);

    // Hardened cookie settings based on environment
    const { cookie } = environment;
    this._cookieService.set(AUTH_TOKEN_NAME, loginDto.accessToken, {
      expires: 365,
      path: cookie.path,
      secure: cookie.secure,
      domain: cookie.domain,
      sameSite: cookie.sameSite as 'Lax' | 'Strict' | 'None' | undefined
    });
    this.loggedChange.emit(true);
  }

  logout(redirectUrl?: string): void {
    localStorage.setItem('circloRedirectUrl', redirectUrl || '');
    this._router.navigateByUrl('/logout');
  }
}
