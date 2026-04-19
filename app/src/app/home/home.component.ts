import { Component, inject } from '@angular/core';
import { Sidebar } from '@app/sidebar/sidebar/sidebar.component';
import { RouterOutlet } from '@angular/router';
import { HomeAsideComponent } from '@app/home-aside/home-aside.component';
import { AppStore } from '@store/app.store';
import { SeoService } from '@ngstarter/components/core';
import { LayoutSlotComponent } from '@app/layout-slot/layout-slot.component';

@Component({
  standalone: true,
  imports: [
    Sidebar,
    RouterOutlet,
    HomeAsideComponent,
    LayoutSlotComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private _appStore = inject(AppStore);
  private _seoService = inject(SeoService);

  constructor() {
    this._seoService.updateDescription(this._appStore.siteDescription());
  }
}
