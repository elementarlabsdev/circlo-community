import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label, Prefix } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { Icon } from '@ngstarter-ui/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Ripple } from '@ngstarter-ui/components/core';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslateService } from '@services/translate.service';

@Component({
  standalone: true,
  imports: [
    Button,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    Prefix,
    CdkDropList,
    CdkDragHandle,
    Icon,
    Button,
    CdkDrag,
    FormsModule,
    Menu,
    MenuItem,
    Ripple,
    MenuTrigger,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe
  ],
  templateUrl: './social-media-links.component.html',
  styleUrl: './social-media-links.component.scss'
})
export class SocialMediaLinksComponent implements OnInit {
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _snackBar = inject(SnackBar);
  private _translateService = inject(TranslateService);

  form = this._formBuilder.group({
    socialMediaLinks: [[]]
  });
  loading = true;

  availableSocialMediaLinks = signal<any>([]);
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
        id: 'socialMediaLinks',
        name: 'breadcrumbs.settings.socialMediaLinks',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/social-media-links')
      .subscribe((res: any) => {
        this.availableSocialMediaLinks.set(res.availableSocialMediaLinks);
        this.form.setValue({
          socialMediaLinks: res.socialMediaLinks,
        });
        this.loaded.set(true);
      });
  }

  get formSocialMediaLinks(): any[] {
    return this.form.value['socialMediaLinks'] as unknown as any[];
  }

  getSocialMediaLink(type: string) {
    return this.availableSocialMediaLinks().find((link: any) => link.type === type);
  }

  addSocialMediaLink(socialMediaLink: any) {
    const formSocialMediaLinks = this.formSocialMediaLinks;
    const hasSocialMediaLink = formSocialMediaLinks.find(
      (formSocialMediaLink: any) => formSocialMediaLink.type === socialMediaLink.type
    );

    if (!hasSocialMediaLink) {
      formSocialMediaLinks.push({
        type: socialMediaLink.type,
        url: '',
        position: formSocialMediaLinks.length
      });
      // @ts-ignore
      this.form.get('socialMediaLinks')?.setValue(formSocialMediaLinks);
    }
  }

  save(): void {
    this._api
      .post('admin/settings/social-media-links', this.form.value)
      .subscribe((res: any) => {
        this._snackBar.open(this._translateService.instant('admin.settings.social.saved'), '', {
          duration: 3000
        });
      })
    ;
  }

  drop(event: CdkDragDrop<any[]>) {
    const formSocialMediaLinks = this.formSocialMediaLinks;
    moveItemInArray(formSocialMediaLinks, event.previousIndex, event.currentIndex);
    formSocialMediaLinks.forEach((provider: any, index: number) => {
      provider.position = index;
    });
    // @ts-ignore
    this.form.get('socialMediaLinks')?.setValue(formSocialMediaLinks);
  }
}
