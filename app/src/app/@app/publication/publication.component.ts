import { Component, computed, inject, input, output, DestroyRef } from '@angular/core';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { Channel, Publication } from '@model/interfaces';
import { RouterLink } from '@angular/router';
import { Icon } from '@ngstarter-ui/components/icon';
import { Divider } from '@ngstarter-ui/components/divider';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { BookmarkButtonComponent } from '@app/bookmark-button/bookmark-button.component';
import { ReactionListComponent } from '@app/reaction-list/reaction-list.component';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { CommentsCountComponent } from '@app/comments-count/comments-count.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ViewsCount } from '@app/views-count/views-count';
import { ReadingTime } from '@app/reading-time/reading-time';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { AppStore } from '@store/app.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Button } from '@ngstarter-ui/components/button';

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [
    RouterLink,
    TimeAgoPipe,
    Icon,
    Divider,
    Dicebear,
    BookmarkButtonComponent,
    ReactionListComponent,
    ImageProxyPipe,
    CommentsCountComponent,
    TranslocoPipe,
    ViewsCount,
    ReadingTime,
    Button
  ],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss'
})
export class PublicationComponent {
  private _confirmManager = inject(ConfirmManager);
  private _api = inject(ApiService);
  private _snack = inject(SnackBar);
  private _transloco = inject(TranslocoService);
  private _appStore = inject(AppStore);
  private _destroyRef = inject(DestroyRef);
  private _ability = inject(Ability);

  publication = input.required<Publication>();
  reactions = input.required<any>();

  deleted = output<string>();

  canDelete = computed(() => {
    const profile = this._appStore.profile();
    if (!profile) {
      return false;
    }
    return profile.id === this.publication().author.id || this._ability.can(Action.Manage, 'all');
  });

  delete() {
    const confirmDef = this._confirmManager.open({
      title: this._transloco.translate('publication.deleteTitle'),
      description: this._transloco.translate('publication.deleteDescription')
    });
    confirmDef.confirmed
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._api.delete(`publication/${this.publication().id}`)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
            next: () => {
              this._snack.open(this._transloco.translate('publication.deleted'), 'OK', { duration: 3000 });
              this.deleted.emit(this.publication().id);
            },
            error: () => {
              this._snack.open(this._transloco.translate('publication.failedToDelete'), 'OK', { duration: 3000 });
            }
          });
      });
  }

  get channel(): Channel | null {
    return this.publication().channel;
  }
}
