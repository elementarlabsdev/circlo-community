import { Component, inject, input, OnInit } from '@angular/core';
import {  Button } from '@ngstarter/components/button';
import { Card, CardContent, CardTitle } from '@ngstarter/components/card';
import { environment } from '../../../../../environments/environment';
import { AppStore } from '@store/app.store';
import { Dicebear } from '@ngstarter/components/avatar';
import { Icon } from '@ngstarter/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-x-integration',
  imports: [
    Card,
    CardContent,

    Dicebear,
    Icon,
    Button,
    Menu,
    MenuItem,
    MenuTrigger,
    TranslocoPipe
  ],
  templateUrl: './x-integration.component.html',
  styleUrl: './x-integration.component.scss'
})
export class XIntegrationComponent implements OnInit {
  private appStore = inject(AppStore);

  readonly integration = input.required<any>();

  ngOnInit() {
    // console.log(this.service());
  }

  get connectUrl() {
    return `${environment.apiUrl}integrations/x/connect/${this.appStore.profile()?.id}`;
  }

  get user() {
    return this.integration().settings?.user;
  }

  get userProfileUrl(): string {
    return 'https://x.com/' + this.user.username;
  }

  configure() {
  }

  refresh() {
  }

  disconnect() {
  }
}
