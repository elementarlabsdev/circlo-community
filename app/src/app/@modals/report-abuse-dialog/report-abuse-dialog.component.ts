import { Component, inject, OnInit, PLATFORM_ID, signal, computed } from '@angular/core';
import { DIALOG_DATA, DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter/components/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { Input } from '@ngstarter/components/input';
import { FormField, Label } from '@ngstarter/components/form-field';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { AppStore } from '@store/app.store';
import { Alert } from '@ngstarter/components/alert';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { RadioButton, RadioGroup } from '@ngstarter/components/radio';
import { TextareaAutoSize } from '@ngstarter/components/core';
import { CaptchaService, CaptchaResult } from '@services/captcha.service';

declare const grecaptcha: any;

export type ReportAbuseDialogData = {
  targetType: string;
  targetId: string;
  reportedUrl?: string | null;
};

export type ReportAbuseDialogResult =
  | { submitted: true; reason: string; details?: string; reportedUrl?: string | null }
  | { submitted: false };

@Component({
  selector: 'app-report-abuse-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    Input,
    FormField,
    Alert,
    TranslocoPipe,
    DialogTitle,
    DialogContent,
    RadioGroup,
    RadioButton,
    Label,
    DialogActions,
    TextareaAutoSize
  ],
  templateUrl: './report-abuse-dialog.component.html',
  styleUrl: './report-abuse-dialog.component.scss',
})
export class ReportAbuseDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(DialogRef<ReportAbuseDialogComponent, ReportAbuseDialogResult>);
  private api = inject(ApiService);
  private appStore = inject<any>(AppStore);
  private snackBar = inject(SnackBar);
  private captchaService = inject(CaptchaService);
  data = inject<ReportAbuseDialogData>(DIALOG_DATA);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
  }

  isUserLoggedIn() {
    return this.appStore.isLogged();
  }

  reasons = [
    { code: 'rude', name: 'reportAbuse.reason.rude' },
    { code: 'harassment', name: 'reportAbuse.reason.harassment' },
    { code: 'copyright', name: 'reportAbuse.reason.copyright' },
    { code: 'inappropriate', name: 'reportAbuse.reason.inappropriate' },
    { code: 'other', name: 'reportAbuse.reason.other' },
  ];

  form = this.fb.group({
    reason: this.fb.control<string | null>('other', { validators: [Validators.required] }),
    details: this.fb.control<string>(''),
    reportedUrl: this.fb.control<string | null>(this.data?.reportedUrl ?? (typeof window !== 'undefined' ? window.location.href : '')),
  });

  submitting = signal(false);
  private _captchaConfig = computed(() => this.captchaService.getCaptchaConfig());
  isRecaptcha = computed(() => this._captchaConfig()?.type === 'recaptcha');
  isCaptchaConfigured = computed(() => !!this._captchaConfig() || this.isUserLoggedIn());

  close(submitted: boolean) {
    if (!submitted) {
      this.dialogRef.close({ submitted: false });
      return;
    }
  }

  submit() {
    if (this.form.invalid || this.submitting()) {
      return;
    }

    if (this.isUserLoggedIn()) {
      this._submit();
      return;
    }

    this.submitting.set(true);
    this.captchaService.execute('SEND_COMPLAINT')
      .then((result) => {
        if (result) {
          this._submit(result);
        } else {
          this.submitting.set(false);
        }
      })
      .catch(() => {
        this.submitting.set(false);
      });
  }

  private _submit(captchaResult: CaptchaResult | null | true = null) {
    this.submitting.set(true);
    const v = this.form.value;
    const body: any = {
      targetType: this.data.targetType,
      targetId: this.data.targetId,
      reason: v.reason!,
      details: v.details,
      reportedUrl: v.reportedUrl,
    };
    this.captchaService.injectToken(body, captchaResult);
    this.api
      .post<{ complaint: any }>('complaints', body)
      .subscribe({
        next: (res) => {
          this.snackBar.open('Your report has been submitted. Thank you!', 'OK', { duration: 3000 });
          this.dialogRef.close();
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err?.error?.message || (err?.status === 0 ? 'Network error. Please try again.' : 'Failed to submit complaint');
          this.snackBar.open(msg, 'Dismiss', { duration: 3500 });
        },
      });
  }
}
