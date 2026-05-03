import { Component, OnInit, inject, signal } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { CommentsApi } from '../comments.api';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { TranslateService } from '@services/translate.service';
import { TextareaAutoSize } from '@ngstarter-ui/components/core';

@Component({
  selector: 'admin-comment-edit',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    Input,
    FormField,
    Label,
    SlideToggle,
    TextFieldModule,
    PanelContent,
    Panel,
    PanelHeader,
    ReactiveFormsModule,
    RouterLink,
    TimeAgoPipe,
    TranslocoPipe,
    TextareaAutoSize
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(CommentsApi);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslocoService);
  private readonly translateService = inject(TranslateService);
  private readonly confirmManager = inject(ConfirmManager);

  loaded = signal(false);
  saving = signal(false);
  deleting = signal(false);

  form: FormGroup = this.fb.group({
    content: ['', [Validators.required]],
    isHidden: [false],
  });

  comment = signal<any>(null);

  constructor() {
    this.breadcrumbsStore.setBreadcrumbs([
      { id: 'home', route: '/', type: 'link', iconName: 'fluent:home-24-regular' },
      { id: 'admin', route: '/admin', name: this.translate.translate('breadcrumbs.admin'), type: 'link' },
      { id: 'comments', route: '/admin/comments', name: this.translate.translate('breadcrumbs.comments'), type: 'link' },
      { id: 'edit', name: this.translate.translate('breadcrumbs.comments.edit'), type: null }
    ]);
  }

  ngOnInit(): void {
    this.fetch();
  }

  private fetch() {
    const id  = this.route.snapshot.paramMap.get('id') || '';
    this.api.getOne<any>(id).subscribe({
      next: (res) => {
        const comment = res.comment;
        this.comment.set(comment);
        this.form.patchValue({
          content: comment.htmlContent || '',
          isHidden: !!comment.isHidden,
        });
        this.loaded.set(true);
      },
      error: () => {
        this.snack.open('Failed to load comment', '', { duration: 3000 });
        this.router.navigate(['/admin/comments']);
      }
    });
  }

  private setBreadcrumbs(c: any) {

  }

  save() {
    if (this.form.invalid || this.saving()) {
      return;
    }

    const id  = this.route.snapshot.paramMap.get('id') || '';
    const { content, isHidden } = this.form.value as { content: string; isHidden: boolean };
    this.saving.set(true);
    this.api.update(id, { content: content.trim(), htmlContent: content.trim(), isHidden }).subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(this.translateService.instant('admin.comments.edit.saved'), '', { duration: 3000 });
        this.router.navigate(['/admin/comments']);
      },
      error: () => {
        this.saving.set(false);
        this.snack.open(this.translateService.instant('admin.comments.edit.saveFailed'), '', { duration: 3000 });
      }
    });
  }

  delete() {
    const id  = this.route.snapshot.paramMap.get('id') || '';
    const confirmDef = this.confirmManager.open({
      title: this.translateService.instant('table.action.delete'),
      description: this.translateService.instant('admin.comments.edit.deleteConfirm')
    });
    confirmDef.confirmed.subscribe(() => {
      this.deleting.set(true);
      this.api.delete(id).subscribe({
        next: () => {
          this.deleting.set(false);
          this.snack.open(this.translateService.instant('admin.comments.edit.deleted'), '', { duration: 2000 });
          this.router.navigate(['/admin/comments']);
        },
        error: () => {
          this.deleting.set(false);
          this.snack.open(this.translateService.instant('admin.users.edit.deleteFailed'), undefined, { duration: 3000 });
        }
      });
    });
  }

  cancel() {
    this.router.navigate(['/admin/comments']);
  }
}
