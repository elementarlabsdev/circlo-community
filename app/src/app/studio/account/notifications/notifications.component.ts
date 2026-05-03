import { Component, inject, OnInit, signal } from '@angular/core';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { Divider } from '@ngstarter-ui/components/divider';
import { ApiService } from '@services/api.service';
import { AppStore } from '@store/app.store';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';

@Component({
  imports: [
    SlideToggle,
    Divider,
    ReactiveFormsModule,
    Button,
    TranslocoPipe,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  private _api = inject(ApiService);
  private _appStore = inject(AppStore);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _route = inject(ActivatedRoute);
  private _breadcrumbsStore = inject(BreadcrumbsStore);

  loaded = signal(false);

  form = this._formBuilder.group({
    notificationsWhenSomeoneReactsToMyContent: [null, [Validators.required]],
    enableWeeklyNewsletterEmails: [null, [Validators.required]],
    enablePeriodicDigestOfTopPostsFromMyTopics: [null, [Validators.required]],
    enableEmailWhenSomeoneRepliesToMeInCommentThread: [null, [Validators.required]],
    enableEmailWhenSomeoneNewFollowsMe: [null, [Validators.required]],
    enableEmailWhenSomeoneMentionsMe: [null, [Validators.required]],
    enableEmailWhenIReceiveBadge: [null, [Validators.required]],
    enablePushNotificationWhenSomeoneRepliesToMeInCommentThread: [null, [Validators.required]],
    enablePushNotificationWhenSomeoneMentionsMe: [null, [Validators.required]],
    muteAllNotifications: [null, [Validators.required]],
  });

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
        name: 'breadcrumbs.account.notifications',
        id: 'notifications',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('studio/account/notifications')
      .subscribe((res: any) => {
        this.form.setValue({
          notificationsWhenSomeoneReactsToMyContent: res.notificationSettings.notificationsWhenSomeoneReactsToMyContent,
          enableWeeklyNewsletterEmails: res.notificationSettings.enableWeeklyNewsletterEmails,
          enablePeriodicDigestOfTopPostsFromMyTopics: res.notificationSettings.enablePeriodicDigestOfTopPostsFromMyTopics,
          enableEmailWhenSomeoneRepliesToMeInCommentThread: res.notificationSettings.enableEmailWhenSomeoneRepliesToMeInCommentThread,
          enableEmailWhenSomeoneNewFollowsMe: res.notificationSettings.enableEmailWhenSomeoneNewFollowsMe,
          enableEmailWhenSomeoneMentionsMe: res.notificationSettings.enableEmailWhenSomeoneMentionsMe,
          enableEmailWhenIReceiveBadge: res.notificationSettings.enableEmailWhenIReceiveBadge,
          enablePushNotificationWhenSomeoneRepliesToMeInCommentThread: res.notificationSettings.enablePushNotificationWhenSomeoneRepliesToMeInCommentThread,
          enablePushNotificationWhenSomeoneMentionsMe: res.notificationSettings.enablePushNotificationWhenSomeoneMentionsMe,
          muteAllNotifications: res.notificationSettings.muteAllNotifications,
        });
        this.loaded.set(true);
      });
  }

  save(): void {
    this._api
      .post('studio/account/notifications', this.form.value)
      .subscribe((res: any) => {
        this._snackBar.open('Saved', '', {
          verticalPosition: 'top',
          duration: 3000
        });
      });
  }
}
