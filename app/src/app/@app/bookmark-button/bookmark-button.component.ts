import { Component, inject, input, OnInit } from '@angular/core';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { AuthService } from '@services/auth.service';
import { ApiService } from '@services/api.service';
import { BookmarkStore } from '@store/bookmark.store';
import { Skeleton } from '@ngstarter/components/skeleton';
import { LoginGuardComponent } from '@app/login-guard/login-guard.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-bookmark-button',
  imports: [
    Icon,
    Button,
    Skeleton,
    LoginGuardComponent,
    TranslocoPipe
  ],
  templateUrl: './bookmark-button.component.html',
  styleUrl: './bookmark-button.component.scss'
})
export class BookmarkButtonComponent implements OnInit {
  private _authService= inject(AuthService);
  private _api = inject(ApiService);
  protected bookmarkStore = inject(BookmarkStore);
  protected loading = false;
  protected isLogged = this._authService.isLogged();

  targetId = input.required<string>();
  targetType = input.required<string>();

  ngOnInit() {
  }

  toggle(): void {
    if (!this.bookmarkStore.has(this.targetId())) {
      this.add();
    } else {
      this.delete();
    }
  }

  add(): void {
    this.bookmarkStore.add(this.targetId());
    this._api
      .post(`bookmark/${this.targetType()}/${this.targetId()}`)
      .subscribe(() => {
      })
    ;
  }

  delete(): void {
    this.bookmarkStore.delete(this.targetId());
    this._api
      .delete(`bookmark/${this.targetType()}/${this.targetId()}`)
      .subscribe(() => {
      })
    ;
  }
}
