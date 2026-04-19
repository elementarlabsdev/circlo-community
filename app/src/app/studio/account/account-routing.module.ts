import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./common/common.component').then(c => c.CommonComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./my-profile/my-profile.component').then(c => c.MyProfileComponent),
        title: 'myProfile'
      },
      {
        path: 'security',
        loadComponent: () => import('./security/security.component').then(c => c.SecurityComponent),
        title: 'security'
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notifications.component').then(c => c.NotificationsComponent),
        title: 'notifications'
      },
      {
        path: 'donations',
        loadComponent: () => import('./donations/donations').then(c => c.Donations),
        title: 'donations'
      },
      {
        path: 'cookie',
        loadComponent: () => import('./cookie/cookie.component').then(c => c.CookieComponent),
        title: 'cookie'
      },
      {
        path: 'danger-zone',
        loadComponent: () => import('./danger-zone/danger-zone.component').then(c => c.DangerZoneComponent),
        title: 'dangerZone'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
