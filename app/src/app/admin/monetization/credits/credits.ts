import { Component, inject, OnInit, signal } from '@angular/core';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { Alert } from '@ngstarter-ui/components/alert';

@Component({
  selector: 'admin-credits',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    SlideToggle,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe,
    Alert
  ],
  templateUrl: './credits.html',
  styleUrl: './credits.scss'
})
export class AdminCreditsComponent implements OnInit {
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(SnackBar);

  form = this.fb.nonNullable.group({
    monetizationCreditsEnabled: [false]
  });

  loaded = signal(false);
  stripeConfigured = signal(true);

  constructor() {
    this.breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: '',
        route: '/admin/monetization',
        name: this.translate.instant('breadcrumbs.monetization'),
        type: 'link'
      },
      {
        id: '',
        route: '/admin/monetization/credits',
        name: this.translate.instant('breadcrumbs.monetization.credits'),
        type: null
      },
    ]);
  }

  ngOnInit() {
    this.api.get('admin/settings/monetization').subscribe((res: any) => {
      this.stripeConfigured.set(res?.stripeConfigured ?? false);
      this.form.patchValue({
        monetizationCreditsEnabled: !!res?.monetizationCreditsEnabled
      });

      if (!this.stripeConfigured()) {
        this.form.disable();
      }

      this.loaded.set(true);
    });
  }

  save(): void {
    const value = this.form.getRawValue();
    this.api.post('admin/settings/monetization', value).subscribe(() => {
      this.snack.open(this.translate.instant('common.saved'), '', { duration: 3000 });
    });
  }
}
