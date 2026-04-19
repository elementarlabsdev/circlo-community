import { Component, computed, inject, input, output, DestroyRef, OnInit } from '@angular/core';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { BookmarkButtonComponent } from '@app/bookmark-button/bookmark-button.component';
import { CommentsCountComponent } from '@app/comments-count/comments-count.component';
import { Dicebear } from '@ngstarter/components/avatar';
import { Icon } from '@ngstarter/components/icon';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { ReactionListComponent } from '@app/reaction-list/reaction-list.component';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Divider } from '@ngstarter/components/divider';
import { RouterLink } from '@angular/router';
import { Ripple } from '@ngstarter/components/core';
import { Channel, TutorialInterface } from '@model/interfaces';
import { ViewsCount } from '@app/views-count/views-count';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { AppStore } from '@store/app.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-tutorial-preview',
  standalone: true,
  imports: [
    BookmarkButtonComponent,
    CommentsCountComponent,
    Dicebear,
    Icon,
    ImageProxyPipe,
    Ripple,
    ReactionListComponent,
    TimeAgoPipe,
    TranslocoPipe,
    Divider,
    RouterLink,
    ViewsCount
  ],
  templateUrl: './tutorial-preview.html',
  styleUrl: './tutorial-preview.scss',
})
export class TutorialPreview implements OnInit {
  private _confirmManager = inject(ConfirmManager);
  private _api = inject(ApiService);
  private _snack = inject(SnackBar);
  private _transloco = inject(TranslocoService);
  private _appStore = inject(AppStore);
  private _destroyRef = inject(DestroyRef);
  private _ability = inject(Ability);

  tutorial = input.required<TutorialInterface>();
  reactions = input.required<any>();

  deleted = output<string>();

  canDelete = computed(() => {
    const profile = this._appStore.profile();
    if (!profile) {
      return false;
    }
    return profile.id === this.tutorial().author.id || this._ability.can(Action.Manage, 'all');
  });

  delete() {
    const confirmDef = this._confirmManager.open({
      title: this._transloco.translate('tutorial.deleteTitle'),
      description: this._transloco.translate('tutorial.deleteDescription')
    });
    confirmDef.confirmed
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._api.delete(`tutorial/${this.tutorial().id}`)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
            next: () => {
              this._snack.open(this._transloco.translate('tutorial.deleted'), 'OK', { duration: 3000 });
              this.deleted.emit(this.tutorial().id);
            },
            error: () => {
              this._snack.open(this._transloco.translate('tutorial.failedToDelete'), 'OK', { duration: 3000 });
            }
          });
      });
  }

  get channel(): Channel | null {
    return this.tutorial().channel;
  }

  ngOnInit() {
  }

  getUrl(): string[] {
    return ['/tutorial', this.tutorial().slug];
  }
}
