import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ThreadsApi } from '../threads.api';
import { Button } from '@ngstarter/components/button';
import { Input } from '@ngstarter/components/input';
import { FormField, Label } from '@ngstarter/components/form-field';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { TranslateService } from '@services/translate.service';
import { TextareaAutoSize } from '@ngstarter/components/core';

@Component({
  selector: 'admin-thread-edit',
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
  private readonly api = inject(ThreadsApi);
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
    repliesCount: [0, [Validators.required, Validators.min(0)]],
    reactionsCount: [0, [Validators.required, Validators.min(0)]],
  });

  thread = signal<any>(null);

  constructor() {
    this.breadcrumbsStore.setBreadcrumbs([
      { id: 'home', route: '/', type: 'link', iconName: 'fluent:home-24-regular' },
      { id: 'admin', route: '/admin', name: this.translate.translate('breadcrumbs.admin'), type: 'link' },
      { id: 'threads', route: '/admin/threads', name: this.translate.translate('breadcrumbs.threads'), type: 'link' },
      { id: 'edit', name: this.translate.translate('breadcrumbs.threads.edit'), type: null }
    ]);
  }

  ngOnInit(): void {
    this.fetch();
  }

  private fetch() {
    const id  = this.route.snapshot.paramMap.get('id') || '';
    this.api.getOne<any>(id).subscribe({
      next: (res) => {
        const thread = res.thread;
        this.thread.set(thread);
        this.form.patchValue({
          content: thread.textContent || '',
          isHidden: !!thread.isHidden,
          repliesCount: thread.repliesCount || 0,
          reactionsCount: thread.reactionsCount || 0,
        });
        this.loaded.set(true);
      },
      error: () => {
        this.snack.open('Failed to load thread', '', { duration: 3000 });
        this.router.navigate(['/admin/threads']);
      }
    });
  }

  save() {
    if (this.form.invalid || this.saving()) {
      return;
    }

    const id  = this.route.snapshot.paramMap.get('id') || '';
    const { content, isHidden, repliesCount, reactionsCount } = this.form.value;
    this.saving.set(true);
    this.api.update(id, {
      textContent: content.trim(),
      isHidden,
      repliesCount: Number(repliesCount),
      reactionsCount: Number(reactionsCount)
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open(this.translateService.instant('admin.threads.edit.saved'), '', { duration: 3000 });
        this.router.navigate(['/admin/threads']);
      },
      error: () => {
        this.saving.set(false);
        this.snack.open(this.translateService.instant('admin.threads.edit.saveFailed'), '', { duration: 3000 });
      }
    });
  }

  delete() {
    const id  = this.route.snapshot.paramMap.get('id') || '';
    const confirmDef = this.confirmManager.open({
      title: this.translateService.instant('table.action.delete'),
      description: this.translateService.instant('admin.threads.edit.deleteConfirm')
    });
    confirmDef.confirmed.subscribe(() => {
      this.deleting.set(true);
      this.api.delete(id).subscribe({
        next: () => {
          this.deleting.set(false);
          this.snack.open(this.translateService.instant('admin.threads.edit.deleted'), '', { duration: 2000 });
          this.router.navigate(['/admin/threads']);
        },
        error: () => {
          this.deleting.set(false);
          this.snack.open(this.translateService.instant('admin.threads.edit.deleteFailed'), undefined, { duration: 3000 });
        }
      });
    });
  }

  cancel() {
    this.router.navigate(['/admin/threads']);
  }
}
