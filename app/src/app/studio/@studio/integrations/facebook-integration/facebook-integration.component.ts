import { Component, inject, input } from '@angular/core';
import { Dicebear } from '@ngstarter/components/avatar';
import {  Button } from '@ngstarter/components/button';
import { Card, CardContent } from '@ngstarter/components/card';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { AppStore } from '@store/app.store';
import { environment } from '../../../../../environments/environment';
import { Icon } from '@ngstarter/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-facebook-integration',
  imports: [
    Dicebear,

    Card,
    CardContent,
    Icon,
    Button,
    Menu,
    MenuItem,
    MenuTrigger,
    TranslocoPipe,
  ],
  templateUrl: './facebook-integration.component.html',
  styleUrl: './facebook-integration.component.scss'
})
export class FacebookIntegrationComponent {
  private appStore = inject(AppStore);

  readonly integration = input.required<any>();

  ngOnInit() {
    // console.log(this.service());
  }

  get connectUrl() {
    return `${environment.apiUrl}integrations/facebook/connect/${this.appStore.profile()?.id}`;
  }

  get user() {
    return this.integration().settings?.user;
  }

  get userProfileUrl(): string {
    return 'https://facebook.com/' + this.user.username;
  }

  configure() {
  }

  refresh() {
  }

  disconnect() {
  }
}
