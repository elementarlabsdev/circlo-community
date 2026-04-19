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
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
        title: 'title.dashboard'
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics').then(m => m.Analytics),
        title: 'title.analytics'
      },
      {
        path: 'activity',
        loadComponent: () => import('./activity/activity').then(m => m.Activity),
        title: 'title.activity'
      },
      {
        path: 'settings',
        loadChildren: () => import('./settings/settings.module').then(c => c.SettingsModule),
        title: 'title.settings'
      },
      {
        path: 'roles',
        loadChildren: () => import('./roles/routes').then(m => m.routes),
        title: 'title.roles'
      },
      {
        path: 'publications',
        loadChildren: () => import('./publications/publications.module').then(c => c.PublicationsModule),
        title: 'title.publications'
      },
      {
        path: 'announcements',
        loadChildren: () => import('./announcements/announcements-module').then(c => c.AnnouncementsModule),
        title: 'title.announcements'
      },
      {
        path: 'tutorials',
        loadChildren: () => import('./tutorials/tutorials-module').then(c => c.TutorialsModule),
        title: 'title.tutorials'
      },
      {
        path: 'topics',
        loadChildren: () => import('./topics/topics.module').then(c => c.TopicsModule),
        title: 'title.topics'
      },
      {
        path: 'channels',
        loadChildren: () => import('./channels/channels.module').then(c => c.ChannelsModule),
        title: 'title.channels'
      },
      {
        path: 'comments',
        loadChildren: () => import('./comments/comments.module').then(c => c.CommentsModule),
        title: 'title.comments'
      },
      {
        path: 'threads',
        loadChildren: () => import('./threads/threads.module').then(c => c.ThreadsModule),
        title: 'title.threads'
      },
      {
        path: 'pages',
        loadChildren: () => import('./pages/pages.module').then(c => c.PagesModule),
        title: 'title.pages'
      },
      {
        path: 'menus',
        loadChildren: () => import('./menu/menu.module').then(c => c.MenuModule),
        title: 'title.menu'
      },
      {
        path: 'users',
        loadChildren: () => import('./users/users.module').then(c => c.UsersModule),
        title: 'title.users'
      },
      {
        path: 'complaints',
        loadChildren: () => import('./complaints/complaints.module').then(c => c.ComplaintsModule),
        title: 'title.complaints'
      },
      {
        path: 'layout',
        loadChildren: () => import('./layout/layout.module').then(c => c.LayoutModule),
        title: 'title.admin.layout'
      },
      {
        path: 'media',
        loadChildren: () => import('./media/media.module').then(c => c.MediaModule),
        title: 'title.media'
      },
      {
        path: 'monetization',
        loadChildren: () => import('./monetization/routes').then(m => m.routes),
        title: 'title.monetization'
      },
    ]
  },
  {
    path: 'pages/edit/:hash',
    title: 'Edit Page',
    loadComponent: () => import('./pages/edit/edit').then(c => c.Edit),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
      },
      {
        path: 'overview',
        loadComponent: () => import('./pages/overview/overview').then(c => c.Overview)
      },
      {
        path: 'content',
        loadComponent: () => import('./pages/content/content').then(c => c.Content)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings').then(c => c.Settings)
      },
      {
        path: 'publish',
        loadComponent: () => import('./pages/publish/publish').then(c => c.Publish)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
