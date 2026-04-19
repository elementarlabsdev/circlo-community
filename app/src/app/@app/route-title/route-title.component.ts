import { Component, computed, inject } from '@angular/core';
import { AppStore } from '@store/app.store';

@Component({
  selector: 'app-route-title',
  imports: [
  ],
  templateUrl: './route-title.component.html',
  styleUrl: './route-title.component.scss'
})
export class RouteTitleComponent {
  private _appStore = inject(AppStore);

  title = computed(() => {
    return this._appStore.title();
  });
}
