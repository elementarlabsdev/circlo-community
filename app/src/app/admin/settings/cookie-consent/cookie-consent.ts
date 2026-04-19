import { Component, inject, OnInit, signal } from '@angular/core';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Button } from '@ngstarter/components/button';
import { FormField, Hint, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { Icon } from '@ngstarter/components/icon';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { Option, Select } from '@ngstarter/components/select';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { Accordion, ExpansionPanel, ExpansionPanelHeader, ExpansionPanelTitle } from '@ngstarter/components/expansion';
import { TextareaAutoSize } from '@ngstarter/components/core';

@Component({
  selector: 'app-cookie-consent',
  imports: [
    Panel,
    PanelHeader,
    PanelContent,
    ScrollbarArea,
    TranslocoPipe,
    Button,
    FormField,
    Hint,
    Input,
    Icon,
    SlideToggle,
    Select,
    ReactiveFormsModule,
    Label,
    Accordion,
    ExpansionPanel,
    ExpansionPanelHeader,
    Option,
    ExpansionPanelTitle,
    TextareaAutoSize
  ],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.scss',
})
export class CookieConsent implements OnInit {
  private _fb = inject(FormBuilder);
  private _api = inject(ApiService);
  private _snackBar = inject(SnackBar);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _translocoService = inject(TranslocoService);

  form: FormGroup;
  loaded = signal(false);

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
        id: 'admin',
        route: '/admin',
        name: 'breadcrumbs.admin',
        type: 'link'
      },
      {
        id: 'settings',
        route: '/admin/settings',
        name: 'breadcrumbs.settings',
        type: 'link'
      },
      {
        id: 'cookie-consent',
        name: 'breadcrumbs.settings.cookieConsent',
        type: null
      }
    ]);
  }

  get categories() {
    return this.form.get('categories') as FormArray;
  }

  ngOnInit() {
    this.form = this._fb.group({
      bannerTitle: [''],
      messageText: [''],
      acceptLabel: [''],
      declineLabel: [''],
      position: [''],
      closeOnOverlayClick: [false],
      autoCloseTimer: [true],
      delay: [10],
      categories: this._fb.array([])
    });
    this._api
      .get('admin/settings/cookie-consent')
      .subscribe((res: any) => {
        const settings = res.settings;

        if (settings) {
          this.form.patchValue(settings);

          if (settings.categories) {
            this.categories.clear();
            settings.categories.forEach((category: any) => {
              this.categories.push(this._fb.group({
                id: [category.id],
                name: [category.name],
                shortDescription: [category.shortDescription],
                detailedDescription: [category.detailedDescription],
                isMandatory: [category.isMandatory],
                isExpanded: [category.isExpanded]
              }));
            });
          }
        }

        this.loaded.set(true);
      });
  }

  save() {
    this._api
      .post('admin/settings/cookie-consent', this.form.value)
      .subscribe(() => {
        this._snackBar.open(this._translocoService.translate('admin.settings.cookie-consent.saved'), '', {
          duration: 3000
        });
      });
  }

  addCategory() {
    const categoriesValue = this.categories.value;
    const nextId = categoriesValue.length > 0 ? Math.max(...categoriesValue.map((c: any) => c.id)) + 1 : 1;
    this.categories.push(this._fb.group({
      id: [nextId],
      name: [this._translocoService.translate('admin.settings.cookie-consent.new-category')],
      shortDescription: [''],
      detailedDescription: [''],
      isMandatory: [false],
      isExpanded: [true]
    }));
  }

  removeCategory(index: number) {
    this.categories.removeAt(index);
  }
}
