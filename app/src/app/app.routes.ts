import { Routes } from '@angular/router';
import { isAdminGuard } from './@guards/is-admin.guard';
import { isRegistrationEnabledGuard } from './@guards/is-registration-enabled.guard';
import { isLoggedGuard } from './@guards/is-logged.guard';
import { isNotLoggedGuard } from './@guards/is-not-logged.guard';
import { isCommunityPublicGuard } from '@/guards/is-community-public-guard';
import { isPaidGuard } from './@guards/is-paid.guard';
import { isAlreadyPaidGuard } from './@guards/is-already-paid.guard';
import { featureEnabledGuard } from './@guards/feature-enabled.guard';

import { permissionGuard } from './@guards/permission.guard';
import { Action } from '@services/ability.service';

export const routes: Routes = [
  {
    path: 'email/:hash/verification',
    loadComponent: () => import('./auth/email-verification/email-verification.component')
      .then(c => c.EmailVerificationComponent),
    title: 'routing.emailVerification.title',
    canActivate: [isNotLoggedGuard]
  },
  {
    path: 'email-verified',
    loadComponent: () => import('./auth/email-verified/email-verified.component')
      .then(c => c.EmailVerifiedComponent),
    title: 'routing.emailVerified.title',
    canActivate: [isNotLoggedGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./auth/forgot-password/forgot-password.component')
      .then(c => c.ForgotPasswordComponent),
    title: 'routing.forgotPassword.title',
    canActivate: [isNotLoggedGuard],
  },
  {
    path: 'password-verification/:hash',
    loadComponent: () => import('./auth/password-verification/password-verification.component')
      .then(c => c.PasswordVerificationComponent),
    title: 'routing.passwordVerification.title',
    canActivate: [isNotLoggedGuard]
  },
  {
    path: 'set-new-password/:hash',
    loadComponent: () => import('./auth/set-new-password/set-new-password.component')
      .then(c => c.SetNewPasswordComponent),
    title: 'routing.setNewPassword.title',
    canActivate: [isNotLoggedGuard]
  },
  {
    path: 'password-restored',
    loadComponent: () => import('./auth/password-restored/password-restored.component')
      .then(c => c.PasswordRestoredComponent),
    title: 'routing.passwordRestored.title',
    canActivate: [isNotLoggedGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/signin/signin.component').then(c => c.SigninComponent),
    title: 'routing.login.title',
    canActivate: [isNotLoggedGuard],
  },
  {
    path: 'logout',
    loadComponent: () => import('./auth/logout/logout').then(c => c.Logout),
    title: 'routing.login.logout',
    canActivate: [isLoggedGuard, isPaidGuard],
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./error/access-denied/access-denied.component').then(c => c.AccessDeniedComponent),
    title: 'routing.forbidden.title'
  },
  {
    path: 'register',
    canActivate: [isNotLoggedGuard, isRegistrationEnabledGuard],
    loadComponent: () => import('./auth/signup/signup.component').then(c => c.SignupComponent),
    title: 'routing.register.title'
  },
  {
    path: 'error',
    loadChildren: () => import('./error/error.module').then(m => m.ErrorModule)
  },
  {
    path: 'studio',
    loadChildren: () => import('./studio/studio.module').then(m => m.StudioModule),
    canActivate: [isLoggedGuard, isPaidGuard]
  },
  {
    path: 'checkout',
    canActivate: [isLoggedGuard, isAlreadyPaidGuard],
    loadComponent: () =>
      import('./checkout/main/main').then((m) => m.CheckoutComponent),
  },
  {
    path: 'checkout/success',
    loadComponent: () =>
      import('./checkout/success/success').then(
        (m) => m.CheckoutSuccessComponent,
      ),
  },
  {
    path: 'checkout/cancel',
    loadComponent: () =>
      import('./checkout/cancel/cancel').then(
        (m) => m.CheckoutCancelComponent,
      ),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [isLoggedGuard, isAdminGuard],
  },
  {
    path: '',
    canActivate: [isCommunityPublicGuard, isPaidGuard],
    loadComponent: () => import('./common/common.component').then(c => c.CommonComponent),
    children: [
      {
        path: 'publication/:slug',
        canActivate: [featureEnabledGuard('contentAllowPublications')],
        loadComponent: () => import('./view/view.component').then(c => c.ViewComponent)
      },
      {
        path: 'tutorial',
        canActivate: [featureEnabledGuard('contentAllowTutorials')],
        loadChildren: () => import('./tutorial-view/tutorial-view-module').then(m => m.TutorialViewModule)
      },
      {
        path: 'page/:slug',
        loadComponent: () => import('./page/page.component').then(c => c.PageComponent)
      },
      {
        path: 'credits',
        canActivate: [permissionGuard],
        data: { action: Action.Read, subject: 'Credits' },
        loadComponent: () => import('./@app/credits/credits.component').then(c => c.CreditsComponent)
      },
      {
        path: 'channel/:slug',
        loadComponent: () => import('./channel/channel.component').then(c => c.ChannelComponent)
      },
      {
        path: 'channel/:slug/page/:pageNumber',
        loadComponent: () => import('./channel/channel.component').then(c => c.ChannelComponent),
      },
      {
        path: 'topic/:slug',
        loadComponent: () => import('./topic/topic.component').then(c => c.TopicComponent)
      },
      {
        path: 'topic/:slug/page/:pageNumber',
        loadComponent: () => import('./topic/topic.component').then(c => c.TopicComponent),
      },
      {
        path: 'user/:username',
        loadComponent: () => import('./user/user.component').then(c => c.UserComponent)
      },
      {
        path: 'user/:username/page/:pageNumber',
        loadComponent: () => import('./user/user.component').then(c => c.UserComponent),
      },
      {
        path: 'discussion/:id',
        loadComponent: () => import('./discussion/discussion').then(c => c.Discussion)
      },
      {
        path: 'thread/:id',
        canActivate: [featureEnabledGuard('contentAllowThreads')],
        loadComponent: () => import('./thread-discussion/thread-discussion').then(c => c.ThreadDiscussion)
      },
      {
        path: '',
        loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
        children: [
          {
            path: 'channels',
            loadComponent: () => import('./channels/channels.component').then(c => c.ChannelsComponent),
            title: 'routing.channels.title'
          },
          {
            path: 'channels/page/:pageNumber',
            loadComponent: () => import('./channels/channels.component').then(c => c.ChannelsComponent),
            title: 'routing.channels.title'
          },
          {
            path: 'topics',
            loadComponent: () => import('./topics/topics.component').then(c => c.TopicsComponent),
            title: 'routing.topics.title'
          },
          {
            path: 'topics/page/:pageNumber',
            loadComponent: () => import('./topics/topics.component').then(c => c.TopicsComponent),
            title: 'routing.topics.title'
          },
          {
            path: 'bookmarks',
            loadComponent: () => import('./bookmarks/bookmarks.component').then(c => c.BookmarksComponent),
            title: 'routing.bookmarks.title'
          },
          {
            path: 'bookmarks/page/:pageNumber',
            loadComponent: () => import('./bookmarks/bookmarks.component').then(c => c.BookmarksComponent),
            title: 'routing.bookmarks.title'
          },
          {
            path: 'subscriptions',
            loadComponent: () => import('./subscriptions/subscriptions.component').then(c => c.SubscriptionsComponent),
            title: 'routing.subscriptions.title'
          },
          {
            path: 'subscriptions/page/:pageNumber',
            loadComponent: () => import('./subscriptions/subscriptions.component').then(c => c.SubscriptionsComponent),
            title: 'routing.subscriptions.title'
          },
          {
            path: 'publications/page/:pageNumber',
            canActivate: [featureEnabledGuard('contentAllowPublications')],
            loadComponent: () => import('./publications/publications.component').then(c => c.PublicationsComponent),
          },
          {
            path: 'search',
            loadComponent: () => import('./search/search.component').then(c => c.SearchComponent),
            title: 'routing.search.title'
          },
          {
            path: 'search/page/:pageNumber',
            loadComponent: () => import('./search/search.component').then(c => c.SearchComponent),
            title: 'routing.search.title'
          },
          {
            path: '',
            pathMatch: 'full',
            loadComponent: () => import('./feed/feed').then(c => c.Feed),
          }
        ]
      },
    ]
  },
  {
    path: '**',
    title: 'routing.pageNotFound.title',
    loadComponent: () => import('./error/not-found/not-found.component').then(c => c.NotFoundComponent)
  }
];
