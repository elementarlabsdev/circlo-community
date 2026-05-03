import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesApi } from '../roles.api';
import { Router, RouterLink } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';
import { Error, FormField, Label } from '@ngstarter-ui/components/form-field';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';

@Component({
  selector: 'app-roles-new',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    FormField,
    Input,
    Label,
    Error,
    Panel,
    PanelHeader,
    PanelContent,
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle
  ],
  templateUrl: './new.html',
  styleUrl: './new.scss',
})
export class New {
  private readonly fb = inject(FormBuilder);
  private readonly rolesApi = inject(RolesApi);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  saving = false;

  form = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    type: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
  });

  constructor() {
    this.breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'admin',
        route: '/admin',
        name: this.translate.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'roles',
        route: '/admin/roles',
        name: 'Roles',
        type: 'link'
      },
      {
        id: 'new',
        name: 'New role',
        type: null
      }
    ]);
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;
    this.rolesApi.create(this.form.value as any).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Role created', 'OK', { duration: 2000 });
        this.router.navigate(['/admin/roles']);
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err?.error?.message || 'Create failed', undefined, { duration: 3000 });
      }
    });
  }
}
