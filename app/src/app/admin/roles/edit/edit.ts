import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolesApi } from '../roles.api';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Button } from '@ngstarter/components/button';
import { Input } from '@ngstarter/components/input';
import { Error, FormField, Label } from '@ngstarter/components/form-field';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter/components/toolbar';

@Component({
  selector: 'app-roles-edit',
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
    ToolbarTitle,
    ToolbarSpacer
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.scss',
})
export class Edit implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly rolesApi = inject(RolesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  saving = false;
  loading = true;
  roleId: string = '';
  isBuiltIn = false;

  form = this.fb.group({
    name: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    type: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
  });

  constructor() {
    this.roleId = this.route.snapshot.params['id'];
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
        id: 'edit',
        name: 'Edit role',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this.rolesApi.findById(this.roleId).subscribe({
      next: (role) => {
        this.isBuiltIn = role.isBuiltIn;
        this.form.patchValue({
          name: role.name,
          type: role.type
        });
        if (this.isBuiltIn) {
          this.form.controls.type.disable();
        }
        this.loading = false;
      },
      error: () => {
        this.snack.open('Failed to load role', undefined, { duration: 3000 });
        this.router.navigate(['/admin/roles']);
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;
    this.rolesApi.update(this.roleId, this.form.getRawValue()).subscribe({
      next: () => {
        this.saving = false;
        this.snack.open('Role updated', 'OK', { duration: 2000 });
        this.router.navigate(['/admin/roles']);
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err?.error?.message || 'Update failed', undefined, { duration: 3000 });
      }
    });
  }
}
