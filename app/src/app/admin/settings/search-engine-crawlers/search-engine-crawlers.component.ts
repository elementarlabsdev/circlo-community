import { Component, inject, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslateService } from '@services/translate.service';
import { TextareaAutoSize } from '@ngstarter-ui/components/core';

@Component({
  selector: 'app-search-engine-crawlers',
  imports: [
    Button,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe,
    TextareaAutoSize
  ],
  templateUrl: './search-engine-crawlers.component.html',
  styleUrl: './search-engine-crawlers.component.scss'
})
export class SearchEngineCrawlersComponent {
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _translateService = inject(TranslateService);

  form = this._formBuilder.group({
    robotsTxtContent: ['', Validators.required],
  });
  loaded = signal(false);

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'admin',
        route: '/admin',
        name: 'breadcrumbs.admin',
        type: 'link'
      },
      {
        id: 'admin',
        route: '/admin/settings',
        name: 'breadcrumbs.settings',
        type: 'link'
      },
      {
        id: 'robots',
        name: 'breadcrumbs.settings.search-engine-crawlers',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/search-engine-crawlers')
      .subscribe((res: any) => {
        this.form.setValue({
          robotsTxtContent: res.settings.robotsTxtContent,
        });
        this.loaded.set(true);
      });
  }

  save(): void {
    this._api
      .post('admin/settings/search-engine-crawlers', this.form.value)
      .subscribe((res: any) => {
        this._snackBar.open(this._translateService.instant('admin.settings.general.saved'), '', {
          duration: 3000
        });
      })
    ;
  }
}
