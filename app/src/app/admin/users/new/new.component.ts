import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersApi } from '../users.api';
import { Router, RouterLink } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { Input } from '@ngstarter-ui/components/input';
import { Error, FormField, IconButtonSuffix, Label } from '@ngstarter-ui/components/form-field';
import { Select } from '@ngstarter-ui/components/select';
import { Option } from '@ngstarter-ui/components/option';
import { Checkbox } from '@ngstarter-ui/components/checkbox';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { Icon } from '@ngstarter-ui/components/icon';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    FormField,
    Input,
    Label,
    Error,
    Select,
    Option,
    Checkbox,
    Panel,
    PanelHeader,
    PanelContent,
    Button,
    Icon,
    SlideToggle,
    TranslocoPipe,
    IconButtonSuffix
  ],
  templateUrl: './new.component.html',
  styleUrl: './new.component.scss'
})
export class NewComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(UsersApi);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  userCreatedMessage = this.translate.translate('admin.users.new.userCreated');

  saving = false;
  roles: Array<{ id: string; name: string; type: string }> = [];
  loadingRoles = false;

  passwordVisibility = signal('text');

  form = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    roleId: [{ value: '', disabled: true }, Validators.required],
    verified: [false],
    sendEmail: [true],
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
        id: 'new',
        name: this.translate.instant('breadcrumbs.admin.users.new'),
        type: null
      }
    ]);
    this.loadRoles();
    // auto-generate a secure password on form open
    this.generateAndSetPassword();
  }

  private generatePassword(minLen: number = 16, maxLen: number = 20): string {
    const length = Math.max(minLen, Math.min(maxLen, Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen));
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const specials = '!@#$%^*()-_=+[]{};:,.?';
    const all = lowers + uppers + digits + specials;

    // Ensure at least one of each category
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
    const required = [pick(lowers), pick(uppers), pick(digits), pick(specials)];
    const remainingLen = Math.max(0, length - required.length);
    const rest = Array.from({ length: remainingLen }, () => pick(all));
    const pool = [...required, ...rest];
    // shuffle
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

  loadRoles() {
    this.loadingRoles = true;
    this.api.listRoles().subscribe({
      next: (roles) => {
        this.roles = roles || [];
        this.loadingRoles = false;
        this.form.get('roleId')?.enable();
      },
      error: () => {
        this.loadingRoles = false;
        this.snack.open('Failed to load roles', undefined, { duration: 3000 });
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.saving = true;
    this.api.create(this.form.value as any).subscribe({
      next: (res) => {
        this.saving = false;
        this.snack.open('User created', undefined, { duration: 2000 });
        this.router.navigate(['/admin/users', res.id, 'edit']);
      },
      error: (err) => {
        this.saving = false;
        this.snack.open(err?.error?.message || 'Create failed', undefined, { duration: 3000 });
      }
    });
  }

  togglePasswordVisibility() {
    this.passwordVisibility.set(this.passwordVisibility() === 'text' ? 'password' : 'text');
  }
}
