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
        loadComponent: () => import('./general/general.component').then(c => c.GeneralComponent),
        title: 'title.settings.general-settings'
      },
      {
        path: 'reading',
        loadComponent: () => import('./reading/reading.component').then(c => c.ReadingComponent),
        title: 'title.settings.reading'
      },
      {
        path: 'content',
        loadComponent: () => import('./content/content.component').then(c => c.ContentComponent),
        title: 'title.settings.content'
      },
      {
        path: 'discussion',
        loadComponent: () => import('./discussion/discussion.component').then(c => c.DiscussionComponent),
        title: 'title.settings.discussion'
      },
      {
        path: 'mail',
        loadComponent: () => import('./mail/mail.component').then(c => c.MailComponent),
        title: 'title.settings.mail'
      },
      {
        path: 'identity',
        loadComponent: () => import('./identity/identity').then(c => c.Identity),
        title: 'title.settings.identity'
      },
      {
        path: 'security',
        loadComponent: () => import('./security/security.component').then(c => c.SecurityComponent),
        title: 'title.settings.security'
      },
      {
        path: 'captcha',
        loadComponent: () => import('./captcha/captcha').then(c => c.Captcha),
        title: 'title.settings.captcha'
      },
      {
        path: 'social-media-links',
        loadComponent: () => import('./social-media-links/social-media-links.component').then(c => c.SocialMediaLinksComponent),
        title: 'title.settings.social-media-links'
      },
      {
        path: 'file-storage',
        loadComponent: () => import('./file-storage/file-storage.component').then(c => c.FileStorageComponent),
        title: 'title.settings.file-storage'
      },
      {
        path: 'analytics',
        loadComponent: () => import('./analytics/analytics.component').then(c => c.AnalyticsComponent),
        title: 'title.settings.analytics'
      },
      {
        path: 'ads',
        loadComponent: () => import('./ads/ads.component').then(c => c.AdsComponent),
        title: 'title.settings.ads'
      },
      {
        path: 'search-engine-crawlers',
        loadComponent: () => import('./search-engine-crawlers/search-engine-crawlers.component').then(c => c.SearchEngineCrawlersComponent),
        title: 'title.settings.search-engine-crawlers'
      },
      {
        path: 'branding',
        loadComponent: () => import('./branding/branding').then(c => c.Branding),
        title: 'title.branding'
      },
      {
        path: 'cookie-consent',
        loadComponent: () => import('./cookie-consent/cookie-consent').then(c => c.CookieConsent),
        title: 'title.settings.cookie-consent'
      },
      {
        path: 'meta-tags',
        loadComponent: () => import('./meta-tags/meta-tags').then(c => c.MetaTags),
        title: 'title.settings.meta-tags'
      },
      {
        path: 'license-key',
        loadComponent: () => import('./license-key/license-key').then(c => c.LicenseKey),
        title: 'title.settings.license-key'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
