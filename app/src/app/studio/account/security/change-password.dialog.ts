import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { ApiService } from '@services/api.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'tw-change-password-dialog',
  standalone: true,
  imports: [
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    ReactiveFormsModule,
    TranslocoPipe,
    FormField,
    Label,
    Input,
  ],
  template: `
    <h2 ngs-dialog-title>{{ 'studio.security.changePassword' | transloco }}</h2>
    <div ngs-dialog-content>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 mt-3 pt-3">
        <ngs-form-field class="w-full">
          <ngs-label>{{ 'studio.security.currentPassword' | transloco }}</ngs-label>
          <input ngsInput type="password" formControlName="currentPassword" required>
        </ngs-form-field>
        <ngs-form-field class="w-full">
          <ngs-label>{{ 'studio.security.newPassword' | transloco }}</ngs-label>
          <input ngsInput type="password" formControlName="newPassword" required>
        </ngs-form-field>
        <ngs-form-field class="w-full">
          <ngs-label>{{ 'studio.security.confirmPassword' | transloco }}</ngs-label>
          <input ngsInput type="password" formControlName="confirmPassword" required>
        </ngs-form-field>
        @if (passwordsDoNotMatch) {
          <div class="text-sm text-red-600">
            {{ 'studio.security.passwordsDoNotMatch' | transloco }}
          </div>
        }
        @if (passwordSameAsCurrent) {
          <div class="text-sm text-red-600">
            {{ 'studio.security.passwordsSameAsCurrent' | transloco }}
          </div>
        }
        @if (error) {
          <div class="text-sm text-red-600">
            {{ error }}
          </div>
        }
      </form>
    </div>
    <div ngs-dialog-actions align="end">
      <button ngsButton (click)="dialogRef.close(false)">{{ 'cancel' | transloco }}</button>
      <button ngsButton="filled" [disabled]="form.invalid || passwordsDoNotMatch || passwordSameAsCurrent"
              (click)="submit()">{{ 'save' | transloco }}
      </button>
    </div>
  `
})
export class ChangePasswordDialogComponent {
  protected dialogRef = inject(DialogRef<ChangePasswordDialogComponent>);
  private _api = inject(ApiService);
  private _fb = inject(FormBuilder);

  error: string | null = null;

  form = this._fb.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  get passwordsDoNotMatch(): boolean {
    const v = this.form.getRawValue();
    return !!v.newPassword && !!v.confirmPassword && v.newPassword !== v.confirmPassword;
  }

  get passwordSameAsCurrent(): boolean {
    const v = this.form.getRawValue();
    return !!v.currentPassword && !!v.newPassword && v.currentPassword === v.newPassword;
  }

  submit(): void {
    this.error = null;
    if (this.form.invalid || this.passwordsDoNotMatch || this.passwordSameAsCurrent) {
      this.form.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.form.getRawValue();
    this._api.post('studio/account/security/change-password', { currentPassword, newPassword }).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        if (err?.error?.message === 'INVALID_CURRENT_PASSWORD') {
          this.error = 'Invalid current password';
        } else if (err?.error?.message === 'NEW_PASSWORD_SAME_AS_CURRENT') {
          this.error = 'New password must be different from current password';
        } else {
          this.error = 'Unable to change password';
        }
      }
    });
  }
}
