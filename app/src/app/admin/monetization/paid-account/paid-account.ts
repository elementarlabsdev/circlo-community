import { Component, inject, OnInit, signal } from '@angular/core';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label, TextSuffix } from '@ngstarter-ui/components/form-field';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { Input } from '@ngstarter-ui/components/input';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { Alert } from '@ngstarter-ui/components/alert';

@Component({
  selector: 'app-paid-account',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    FormField,
    Label,
    SlideToggle,
    Input,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe,
    Alert,
    TextSuffix
  ],
  templateUrl: './paid-account.html',
  styleUrl: './paid-account.scss',
})
export class PaidAccount implements OnInit {
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(SnackBar);

  form = this.fb.nonNullable.group({
    monetizationPaidAccountEnabled: [false],
    monetizationPaidAccountPrice: [0]
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
        route: '/admin/monetization/paid-account',
        name: this.translate.instant('breadcrumbs.monetization.paid-account'),
        type: null
      },
    ]);
  }

  ngOnInit() {
    this.api.get('admin/settings/monetization').subscribe((res: any) => {
      this.stripeConfigured.set(res?.stripeConfigured ?? false);
      this.form.patchValue({
        monetizationPaidAccountEnabled: !!res?.monetizationPaidAccountEnabled,
        monetizationPaidAccountPrice: res?.monetizationPaidAccountPrice ?? 0
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
