import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { ApiService } from '@services/api.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { Input } from '@ngstarter-ui/components/input';

@Component({
  selector: 'tw-change-email-dialog',
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
    <h2 ngs-dialog-title>{{ step() === 1 ? ('studio.security.changeEmail' | transloco) : ('studio.security.confirmEmailChange' | transloco) }}</h2>
    <div ngs-dialog-content>
      @if (step() === 1) {
        <form [formGroup]="emailForm" class="space-y-4 mt-3 pt-3">
          <ngs-form-field class="w-full">
            <ngs-label>{{ 'studio.security.newEmail' | transloco }}</ngs-label>
            <input ngsInput type="email" formControlName="newEmail" required>
          </ngs-form-field>
          @if (error()) {
            <div class="text-sm text-red-600">{{ error() }}</div>
          }
        </form>
      } @else {
        <form [formGroup]="codeForm" class="space-y-4 mt-3 pt-3">
          <div class="text-sm text-neutral-600">
            {{ 'studio.security.emailCodeHint' | transloco }}
          </div>
          <ngs-form-field class="w-full">
            <ngs-label>{{ 'studio.security.verificationCode' | transloco }}</ngs-label>
            <input ngsInput type="text" formControlName="code" maxlength="6" required>
          </ngs-form-field>
          @if (error()) {
            <div class="text-sm text-red-600">{{ error() }}</div>
          }
        </form>
      }
    </div>
    <div ngs-dialog-actions align="end">
      <button ngsButton (click)="dialogRef.close(false)">{{ 'cancel' | transloco }}</button>
      @if (step() === 1) {
        <button ngsButton="filled" [disabled]="emailForm.invalid || loading()" (click)="requestCode()">{{ 'continue' | transloco }}</button>
      } @else {
        <button ngsButton="outlined" [disabled]="loading()" (click)="resend()">{{ 'resend' | transloco }}</button>
        <button ngsButton="filled" [disabled]="codeForm.invalid || loading()" (click)="confirm()">{{ 'confirm' | transloco }}</button>
      }
    </div>
  `
})
export class ChangeEmailDialogComponent {
  protected dialogRef = inject(DialogRef<ChangeEmailDialogComponent>);
  private _api = inject(ApiService);
  private _fb = inject(FormBuilder);

  step = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);
  newEmailValue: string | null = null;

  emailForm = this._fb.nonNullable.group({
    newEmail: ['', [Validators.required, Validators.email]]
  });

  codeForm = this._fb.nonNullable.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  requestCode(): void {
    this.error.set(null);
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const { newEmail } = this.emailForm.getRawValue();
    this.loading.set(true);
    this._api.post('studio/account/security/change-email/request', { newEmail }).subscribe({
      next: () => {
        this.loading.set(false);
        this.newEmailValue = newEmail;
        this.step.set(2);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message;
        if (msg === 'EMAIL_SAME_AS_CURRENT') {
          this.error.set('New email must be different from current');
        } else if (msg === 'EMAIL_ALREADY_IN_USE') {
          this.error.set('This email is already in use');
        } else {
          this.error.set('Unable to send verification code');
        }
      }
    });
  }

  resend(): void {
    if (!this.newEmailValue) return;
    this.loading.set(true);
    this._api.post('studio/account/security/change-email/request', { newEmail: this.newEmailValue }).subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  confirm(): void {
    this.error.set(null);
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    const { code } = this.codeForm.getRawValue();
    this.loading.set(true);
    this._api.post('studio/account/security/change-email/confirm', { code }).subscribe({
      next: () => {
        this.loading.set(false);
        this.dialogRef.close(this.newEmailValue || true);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message;
        if (msg === 'INVALID_CODE') {
          this.error.set('Invalid verification code');
        } else if (msg === 'CODE_EXPIRED') {
          this.error.set('Verification code expired');
        } else if (msg === 'NO_PENDING_EMAIL_CHANGE') {
          this.error.set('No pending email change');
        } else if (msg === 'EMAIL_ALREADY_IN_USE') {
          this.error.set('This email is already in use');
        } else {
          this.error.set('Unable to confirm email change');
        }
      }
    });
  }
}
