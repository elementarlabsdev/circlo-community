import { Component, computed, inject } from '@angular/core';
import { Dicebear } from '@ngstarter/components/avatar';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { AppStore } from '@store/app.store';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { LoginDto, UserProfile } from '@model/interfaces';
import { ImageProxyPipe } from '../../pipes/image-proxy.pipe';

@Component({
  selector: 'app-user-sidebar-toolbar',
  standalone: true,
  imports: [
    Dicebear,
    Button,
    Icon,
    ImageProxyPipe
  ],
  templateUrl: './user-sidebar-toolbar.component.html',
  styleUrl: './user-sidebar-toolbar.component.scss'
})
export class UserSidebarToolbarComponent {
  private _appStore = inject(AppStore);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  profile = computed(() => {
    return this._appStore.profile() as LoginDto;
  });

  logout(): void {
    this._authService.logout();
    this._router.navigateByUrl('/');
  }
}
