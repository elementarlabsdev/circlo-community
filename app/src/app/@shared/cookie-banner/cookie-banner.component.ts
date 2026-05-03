import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Button } from '@ngstarter-ui/components/button';
import { TranslocoModule } from '@jsverse/transloco';
import { Dialog } from '@ngstarter-ui/components/dialog';
import {
  CookieCategory,
  CookieCustomizationDialogComponent,
  CookieCustomizationResult,
  CookiePreferences
} from './cookie-customization-dialog.component';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [
    Button,
    TranslocoModule
  ],
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss'
})
export class CookieBannerComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private dialog = inject(Dialog);
  private api = inject(ApiService);
  isVisible = signal(false);

  settings: any = null;
  categories: CookieCategory[] = [];
  preferences: CookiePreferences = {};

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const consent = localStorage.getItem('cookie-consent');
      const storedPrefs = localStorage.getItem('cookie-preferences');

      if (storedPrefs) {
        try {
          this.preferences = JSON.parse(storedPrefs);
        } catch (e) {
          this.preferences = {};
        }
      }

      if (!consent) {
        this.api.get('cookie-consent').subscribe((res: any) => {
          this.settings = res.settings;
          this.categories = this.settings?.categories || [];
          this.isVisible.set(true);
        });
      }
    }
  }

  accept() {
    if (isPlatformBrowser(this.platformId)) {
      const prefs: CookiePreferences = {};
      this.categories.forEach(cat => {
        prefs[cat.id] = true;
      });
      localStorage.setItem('cookie-consent', 'true');
      localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
      this.isVisible.set(false);
    }
  }

  customize() {
    const dialogRef = this.dialog.open<CookieCustomizationDialogComponent, any, CookieCustomizationResult>(
      CookieCustomizationDialogComponent,
      {
        width: '100%',
        maxWidth: '672px',
        data: {
          preferences: this.preferences,
          categories: this.categories,
          settings: this.settings
        },
        panelClass: 'cookie-customization-dialog'
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action !== 'close') {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('cookie-consent', 'true');
          localStorage.setItem('cookie-preferences', JSON.stringify(result.preferences));
          this.preferences = result.preferences || {};
          this.isVisible.set(false);
        }
      }
    });
  }
}
