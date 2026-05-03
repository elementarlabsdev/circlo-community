import { Component, output, signal } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { File, FileControl, FileList } from '@ngstarter-ui/components/upload';

export type UploadState = 'queued' | 'uploading' | 'done' | 'error' | 'canceled';

export interface UploadFileViewModel {
  id: string;
  size: number;
  state: UploadState;
  errorMessage?: string | null;
  remainingTime?: string | null;
  name: string;
  progress: number; // 0..100
}

@Component({
  imports: [
    Icon,
    FileControl,
    File,
    FileList
  ],
  template: `
    <div class="w-[360px] max-h-[60vh] flex flex-col rounded-xl shadow-2xl border overflow-hidden bg-[var(--ngs-surface,#fff)] text-inherit border-[var(--ngs-outline-variant,rgba(0,0,0,0.08))]">
      <div class="flex items-center justify-between px-3 py-2.5 border-b bg-[var(--ngs-surface-container,#fafafa)] border-b-[var(--ngs-outline-variant,rgba(0,0,0,0.08))]">
        <div class="font-semibold text-[13px]">Uploading files</div>
        <button type="button"
                class="inline-flex items-center justify-center p-1.5 rounded-md text-current hover:bg-[var(--ngs-surface-container-highest,rgba(0,0,0,0.06))]"
                (click)="close.emit()" aria-label="Close">
          <ngs-icon name="fluent:dismiss-circle-24-regular"/>
        </button>
      </div>
      <div class="flex-1 min-h-0 p-2.5 overflow-auto">
        <ngs-file-list>
          @for (uploadFile of fileList(); track uploadFile.id) {
            <ngs-file [size]="uploadFile.size"
                      [state]="uploadFile.state"
                      [errorMessage]="uploadFile.errorMessage"
                      [remainingTime]="uploadFile.remainingTime"
                      [name]="uploadFile.name"
                      [progress]="uploadFile.progress">
              @if (uploadFile.state === 'error') {
                <ngs-file-control (click)="retry.emit(uploadFile.id)">
                  <ngs-icon name="fluent:arrow-counterclockwise-24-regular"/>
                </ngs-file-control>
              }
              <ngs-file-control (click)="remove.emit(uploadFile.id)">
                <ngs-icon name="fluent:dismiss-circle-24-regular"/>
              </ngs-file-control>
            </ngs-file>
          }
        </ngs-file-list>
      </div>
    </div>
  `
})
export class UploadOverlayComponent {
  fileList = signal<UploadFileViewModel[]>([]);

  remove = output<string>();
  retry = output<string>();
  close = output<void>();
}
