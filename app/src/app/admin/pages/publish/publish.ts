import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { PagesApi } from '../pages.api';
import { ADMIN_PAGE_EDIT_ROOT, Edit } from '@/admin/pages/edit/edit';
import { TranslocoModule } from '@jsverse/transloco';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';

@Component({
  imports: [Button, Icon, TranslocoModule, TimeAgoPipe],
  templateUrl: './publish.html',
  styleUrl: './publish.scss',
})
export class Publish {
  private readonly editRoot = inject<Edit>(ADMIN_PAGE_EDIT_ROOT);
  private readonly router = inject(Router);
  private readonly api = inject(PagesApi);
  private readonly snack = inject(SnackBar);
  private readonly confirm = inject(ConfirmManager);

  readonly loading = signal(false);
  readonly page = signal<any>(null);

  ngOnInit() {
    const hash = this.editRoot.pageHash();
    this.loading.set(true);
    this.api.getSettings(hash).subscribe({
      next: (res: any) => {
        this.page.set(res.page);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('Failed to load page', undefined, { duration: 3000 });
      }
    });
  }

  publish() {
    const id = this.editRoot.pageId();
    this.api.publish(id).subscribe({
      next: (res: any) => {
        this.page.set(res.page);
        this.snack.open('Published!', 'OK', { duration: 2000 });
      },
      error: () => this.snack.open('Publish failed', undefined, { duration: 3000 })
    });
  }

  unpublish() {
    const id = this.editRoot.pageId();
    const confirmDef = this.confirm.open({
      title: 'Unpublish page',
      description: 'Are you sure you want to unpublish this page?'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.unpublish(id).subscribe({
        next: (res: any) => {
          this.page.set(res.page);
          this.snack.open('Unpublished!', 'OK', { duration: 2000 });
        },
        error: () => this.snack.open('Unpublish failed', undefined, { duration: 3000 })
      });
    });
  }

  delete() {
    const id = this.editRoot.pageId();
    const confirmDef = this.confirm.open({
      title: 'Delete page',
      description: 'Deletion is not reversible. This page will be completely deleted.'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(id).subscribe({
        next: () => {
          this.snack.open('Deleted!', 'OK', { duration: 2000 });
          this.router.navigate(['/admin/pages']);
        },
        error: () => this.snack.open('Delete failed', undefined, { duration: 3000 })
      });
    });
  }
}
