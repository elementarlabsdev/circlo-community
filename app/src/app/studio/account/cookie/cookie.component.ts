import { Component, inject, signal } from '@angular/core';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelDescription,
  ExpansionPanelHeader, ExpansionPanelTitle
} from '@ngstarter/components/expansion';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { ApiService } from '@services/api.service';
import { AppStore } from '@store/app.store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';

@Component({
  selector: 'app-cookie',
  standalone: true,
  imports: [
    Accordion,
    ExpansionPanel,
    ExpansionPanelDescription,
    ExpansionPanelHeader,
    ExpansionPanelTitle,
    SlideToggle,
    ReactiveFormsModule,
    Button,
    TranslocoPipe,
    Panel,
    PanelContent,
    PanelHeader,
    ScrollbarArea,
  ],
  templateUrl: './cookie.component.html',
  styleUrl: './cookie.component.scss'
})
export class CookieComponent {
  private _api = inject(ApiService);
  private _appStore = inject(AppStore);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);

  loaded = signal(false);
  categories = signal<any[]>([]);
  form = this._formBuilder.group({});

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'studio',
        name: 'breadcrumbs.studio',
        route: '/studio',
        type: 'link',
      },
      {
        name: 'breadcrumbs.account',
        id: 'account',
        type: 'link',
        route: '/studio/account',
      },
      {
        name: 'breadcrumbs.account.cookie',
        id: 'cookie',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('studio/account/cookie')
      .subscribe((res: any) => {
        const categories = res.cookieSettings.cookieConsentSettings?.categories || [];
        const preferences = res.cookieSettings.cookiePreferences || {};
        this.categories.set(categories);

        categories.forEach((category: any) => {
          if (!category.isMandatory) {
            this.form.addControl(
              category.id.toString(),
              this._formBuilder.control(preferences[category.id] ?? false)
            );
          }
        });
        this.loaded.set(true);
      });
  }

  save(): void {
    this._api
      .post('studio/account/cookie', {
        cookiePreferences: this.form.value
      })
      .subscribe((res: any) => {
        this._snackBar.open('Saved', '', {
          duration: 3000
        });
      })
    ;
  }
}
