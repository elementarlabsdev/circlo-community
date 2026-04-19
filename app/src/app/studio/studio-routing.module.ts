import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Action } from '@services/ability.service';
import { permissionGuard } from '../@guards/permission.guard';
import { featureEnabledGuard } from '../@guards/feature-enabled.guard';

const routes: Routes = [
  {
    path: 'image-designer/:id/edit',
    loadChildren: () => import('./image-designer/edit/image-designer-edit.module').then(c => c.ImageDesignerEditModule),
    title: 'imageDesigner.edit'
  },
  {
    path: 'publications/edit/:hash',
    canActivate: [featureEnabledGuard('contentAllowPublications')],
    loadComponent: () => import('./publications/edit/edit.component').then(c => c.EditComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
      },
      {
        path: 'overview',
        loadComponent: () => import('./publications/overview/overview').then(c => c.Overview)
      },
      {
        path: 'content',
        loadComponent: () => import('./publications/content/content').then(c => c.Content)
      },
      {
        path: 'settings',
        loadComponent: () => import('./publications/settings/settings').then(c => c.Settings)
      },
      {
        path: 'publish',
        loadComponent: () => import('./publications/publish/publish').then(c => c.Publish)
      },
    ]
  },
  {
    path: '',
    loadComponent: () => import('./main/main.component').then(c => c.MainComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
        title: 'Dashboard',
      },
      {
        path: 'publications',
        canActivate: [featureEnabledGuard('contentAllowPublications')],
        loadChildren: () => import('./publications/publications.module').then(m => m.PublicationsModule),
        title: 'Publications'
      },
      {
        path: 'tutorials',
        canActivate: [featureEnabledGuard('contentAllowTutorials')],
        loadChildren: () => import('./tutorials/tutorials.module').then(m => m.TutorialsModule),
        title: 'Tutorials'
      },
      {
        path: 'account',
        loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
        title: 'Account'
      },
      {
        path: 'notifications',
        loadComponent: () => import('./notifications/notifications.component').then(c => c.NotificationsComponent),
        title: 'Notifications'
      },
      {
        path: 'followers',
        loadComponent: () => import('./followers/followers').then(c => c.Followers),
        title: 'Followers'
      },
      {
        path: 'media',
        loadChildren: () => import('./media/media.module').then(c => c.MediaModule),
        title: 'Media'
      },
      {
        path: 'image-designer',
        loadChildren: () => import('./image-designer/image-designer.module').then(c => c.ImageDesignerModule),
        title: 'imageDesigner.title'
      },
      {
        path: 'credits',
        canActivate: [permissionGuard],
        data: { action: Action.Read, subject: 'Credits' },
        loadComponent: () => import('./credits/credits').then(c => c.Credits),
        title: 'studio.credits'
      },
      {
        path: 'subscription',
        loadChildren: () => import('./subscription/routes').then(m => m.routes),
        title: 'studio.subscription'
      },
      {
        path: 'channels',
        children: [
          {
            path: '',
            loadComponent: () => import('./channels/list/list.component').then(c => c.ListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./channels/edit/edit.component').then(c => c.ChannelEditComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./channels/edit/edit.component').then(c => c.ChannelEditComponent)
          }
        ]
      },
    ]
  },
  {
    path: 'tutorials/:id',
    canActivate: [featureEnabledGuard('contentAllowTutorials')],
    loadComponent: () => import('./tutorials/edit/edit.component').then(c => c.EditComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
      },
      {
        path: 'overview',
        loadComponent: () => import('./tutorials/overview/overview.component').then(c => c.OverviewComponent)
      },
      {
        path: 'content',
        loadChildren: () => import('./tutorials/content/content.module').then(m => m.ContentModule)
      },
      {
        path: 'settings',
        loadComponent: () => import('./tutorials/settings/settings.component').then(c => c.SettingsComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./tutorials/analytics/analytics.component').then(c => c.AnalyticsComponent)
      },
      {
        path: 'publish',
        loadComponent: () => import('./tutorials/publish/publish').then(c => c.Publish)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudioRoutingModule { }
