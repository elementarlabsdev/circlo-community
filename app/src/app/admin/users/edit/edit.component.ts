import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersApi } from '../users.api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';
import { Error, FormField, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Option, Select } from '@ngstarter-ui/components/select';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { Icon } from '@ngstarter-ui/components/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    Button,
    FormField,
    Input,
    Label,
    Error,
    Select,
    Option,
    Checkbox,
    PanelContent,
    Panel,
    PanelHeader,
    Icon,
    Option,
    TranslocoModule,
    IconButtonSuffix,
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  private confirmManager = inject(ConfirmManager);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(UsersApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  userId = this.route.snapshot.paramMap.get('id')!;
  loading = true;
  saving = false;
  isSuperAdminUser = false;

  passwordVisibility = signal<'text' | 'password'>('password');

  roles: Array<{ id: string; name: string; type: string }> = [];
  loadingRoles = false;

  form = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    roleId: [{ value: '', disabled: true }],
    isBlocked: [false],
    verified: [false],
    isSuperAdmin: [false],
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
        id: 'users',
        route: '/admin/users',
        name: this.translate.instant('breadcrumbs.admin.users'),
        type: 'link'
      },
      {
        id: 'edit',
        name: this.translate.instant('breadcrumbs.admin.users.edit'),
        type: null
      }
    ]);
    this.loadRoles();
    this.load();
  }

  loadRoles() {
    this.loadingRoles = true;
    this.api.listRoles().subscribe({
      next: (roles) => {
        this.roles = roles || [];
        this.loadingRoles = false;
        if (!this.isSuperAdminUser) this.form.get('roleId')?.enable();
      },
      error: () => {
        this.loadingRoles = false;
        this.snack.open('Failed to load roles', undefined, { duration: 3000 });
      }
    });
  }

  load() {
    this.loading = true;
    this.api.findById<any>(this.userId).subscribe({
      next: (u) => {
        if (!u) {
          this.snack.open('User not found', undefined, { duration: 3000 });
          this.router.navigate(['/admin/users']);
          return;
        }
        this.form.patchValue({
          name: u.name,
          username: u.username,
          email: u.email,
          roleId: u.roleId,
          isBlocked: u.isBlocked,
          verified: u.verified,
          isSuperAdmin: u.isSuperAdmin,
        });

        // If user is super admin, prevent changing blocked, verified and role selection
        this.isSuperAdminUser = u.isSuperAdmin;
        if (u.isSuperAdmin) {
          this.form.get('isBlocked')?.disable();
          this.form.get('verified')?.disable();
          this.form.get('roleId')?.disable();
        } else {
          this.form.get('isBlocked')?.enable();
          this.form.get('verified')?.enable();
          this.form.get('roleId')?.enable();
        }

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snack.open(this.translate.instant('admin.users.edit.loadUserFailed'), undefined, { duration: 3000 });
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = { ...this.form.value } as any;
    // Ensure super admin flag is never updated from this form
    if ('isSuperAdmin' in payload) delete (payload as any).isSuperAdmin;
    if (!payload.password) delete payload.password; // do not update if empty
    this.api.update(this.userId, payload).subscribe({
      next: () => {
        this.snack.open(this.translate.instant('admin.users.edit.saved'), undefined, { duration: 2000 });
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err?.error?.message || this.translate.instant('admin.users.edit.saveFailed'), undefined, { duration: 3000 });
      }
    });
  }

  delete() {
    const confirmDef = this.confirmManager.open({
      title: this.translate.instant('admin.users.edit.deleteUser'),
      description: this.translate.instant('admin.users.edit.deleteConfirm')
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(this.userId).subscribe({
        next: () => {
          this.snack.open(this.translate.instant('admin.users.edit.deleted'), undefined, { duration: 2000 });
          this.router.navigate(['/admin/users']);
        },
        error: () => this.snack.open(this.translate.instant('admin.users.edit.deleteFailed'), undefined, { duration: 3000 })
      });
    });
  }

  togglePasswordVisibility() {
    this.passwordVisibility.set(this.passwordVisibility() === 'text' ? 'password' : 'text');
  }

  private generatePassword(minLen: number = 16, maxLen: number = 20): string {
    const length = Math.max(minLen, Math.min(maxLen, Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen));
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const specials = '!@#$%^&*()-_=+[]{};:,.?';
    const all = lowers + uppers + digits + specials;

    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
    const required = [pick(lowers), pick(uppers), pick(digits), pick(specials)];
    const remainingLen = Math.max(0, length - required.length);
    const rest = Array.from({ length: remainingLen }, () => pick(all));
    const pool = [...required, ...rest];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.join('');
  }

  generateAndSetPassword() {
    const pwd = this.generatePassword(16, 20);
    this.form.get('password')?.setValue(pwd);
    this.form.get('password')?.markAsDirty();
    this.form.get('password')?.markAsTouched();
  }
}
