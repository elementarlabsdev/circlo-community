import { Component, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { FormField, Label, Hint } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { PagesApi } from '../pages.api';
import { ADMIN_PAGE_EDIT_ROOT, Edit } from '@/admin/pages/edit/edit';
import { Button } from '@ngstarter/components/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { TextareaAutoSize } from '@ngstarter/components/core';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormField,
    Input,
    Label,
    Hint,
    Button,
    TranslocoPipe,
    Panel,
    PanelContent,
    ScrollbarArea,
    PanelHeader,
    TextareaAutoSize,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private readonly editRoot = inject<Edit>(ADMIN_PAGE_EDIT_ROOT);
  private readonly api = inject(PagesApi);
  private readonly snack = inject(SnackBar);
  private readonly fb = inject(FormBuilder);

  readonly loaded = signal(false);
  readonly saving = signal(false);
  readonly page = signal<any>(null);

  form = this.fb.group({
    slug: ['', [Validators.required]],
    metaTitle: [''],
    metaDescription: [''],
  });

  ngOnInit() {
    const hash = this.editRoot.pageHash();
    this.api.getSettings(hash).subscribe({
      next: (res: any) => {
        this.page.set(res.page);
        this.form.setValue({
          slug: res.page.slug,
          metaTitle: res.page.metaTitle,
          metaDescription: res.page.metaDescription || '',
        });
        this.loaded.set(true);
      },
      error: () => {
        this.snack.open('Failed to load page', undefined, { duration: 3000 });
      }
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Please fix the form errors', undefined, { duration: 3000 });
      return;
    }

    const id = this.editRoot.pageId();
    this.saving.set(true);
    this.api.saveSettings(id, this.form.value).subscribe({
      next: (res: any) => {
        this.page.set(res.page);
        this.saving.set(false);
        this.snack.open('Saved!', 'OK', { duration: 2000 });
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('Save failed', undefined, { duration: 3000 });
      }
    });
  }
}
