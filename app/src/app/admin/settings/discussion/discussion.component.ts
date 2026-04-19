import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslateService } from '@services/translate.service';

interface DiscussionSettings {
  commentsEnabled: boolean;
  closeCommentsForOldPosts: boolean;
  closeCommentsDaysOld: number;
  threadCommentsDepth: number;
}

@Component({
  selector: 'app-discussion',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    SlideToggle,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe
  ],
  templateUrl: './discussion.component.html',
  styleUrl: './discussion.component.scss'
})
export class DiscussionComponent {
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _translateService = inject(TranslateService);

  form = this._formBuilder.nonNullable.group({
    commentsEnabled: [false, [Validators.required]],
    closeCommentsForOldPosts: [false, [Validators.required]],
    closeCommentsDaysOld: [{value: 0, disabled: true}, Validators.min(1)],
    threadCommentsDepth: [0, [Validators.required, Validators.min(1), Validators.max(10)]]
  });
  formActive = false;
  settings: DiscussionSettings;

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
        id: 'admin',
        route: '/admin/settings',
        name: 'breadcrumbs.settings',
        type: 'link'
      },
      {
        id: 'discussion',
        name: 'breadcrumbs.settings.discussion',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/discussion')
      .subscribe((res: any) => {
        this.settings = res.settings;
        this._setInitialFormValue();
        this.loaded.set(true);
      })
    ;
    this.form.get('closeCommentsForOldPosts')?.valueChanges.subscribe((value: any) => {
      if (value) {
        this.form.get('closeCommentsDaysOld')?.enable();
      } else {
        this.form.get('closeCommentsDaysOld')?.disable();
      }
    });
  }

  edit(): void {
    this.formActive = true;
  }

  cancel(): void {
    this.formActive = false;
    this._setInitialFormValue();
  }

  save(): void {
    const value = this.form.value as DiscussionSettings;
    this.settings = {...this.settings, ...value};
    this._api
      .post('admin/settings/discussion', this.form.value)
      .subscribe((res: any) => {
        this._snackBar.open(this._translateService.instant('admin.settings.discussion.saved'), '', {
          duration: 3000
        });
      })
    ;
    this.formActive = false;
  }

  private _setInitialFormValue(): void {
    this.form.setValue({
      commentsEnabled: this.settings.commentsEnabled,
      closeCommentsForOldPosts: this.settings.closeCommentsForOldPosts,
      closeCommentsDaysOld: this.settings.closeCommentsDaysOld,
      threadCommentsDepth: this.settings.threadCommentsDepth,
    });
  }
}
