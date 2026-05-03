import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Router, RouterLink } from '@angular/router';
import { AppStore } from '@store/app.store';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { environment } from '../../../environments/environment';
import { AUTH_TOKEN_NAME } from '@/types';
import { AuthService } from '@services/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogoComponent } from '@app/logo/logo.component';
import { Card } from '@ngstarter-ui/components/card';

@Component({
  selector: 'app-logout',
  imports: [
    FormsModule,
    LogoComponent,
    ReactiveFormsModule,
    RouterLink,
    Card,
  ],
  templateUrl: './logout.html',
  styleUrl: './logout.scss',
})
export class Logout implements OnInit {
  private _api = inject(ApiService);
  private _router = inject(Router);
  private _appStore = inject(AppStore);
  private _cookieService = inject(SsrCookieService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  ngOnInit() {
    this._api.post('logout').subscribe(() => {
      setTimeout(() => {
        const { cookie } = environment;
        // Delete root cookie
        this._cookieService.delete(AUTH_TOKEN_NAME, cookie.path, cookie.domain, cookie.secure);

        // Delete current path cookie (if different from root)
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          this._cookieService.delete(AUTH_TOKEN_NAME, window.location.pathname, '', cookie.secure);
          // try with parent path too if possible
          const pathSegments = window.location.pathname.split('/').filter(s => s);
          if (pathSegments.length > 0) {
            this._cookieService.delete(AUTH_TOKEN_NAME, '/' + pathSegments[0], '', cookie.secure);
          }
        }

        this._appStore.setIsLogged(false);
        this._appStore.setProfile(null);
        this.authService.loggedChange.emit(false);
        this._router.navigate([localStorage?.getItem('circloRedirectUrl') || '/'], { replaceUrl: true });
        this.cdr.detectChanges();
      }, 2000);
    });
  }
}
