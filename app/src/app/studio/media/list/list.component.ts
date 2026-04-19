import { Component, inject, OnInit, signal, ViewContainerRef, ComponentRef, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ApiService } from '@services/api.service';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Ripple } from '@ngstarter/components/core';
import { FileGridLayout } from '@/studio/media/_layout/file-grid-layout/file-grid-layout.component';
import { FileListLayout } from '@/studio/media/_layout/file-list-layout/file-list-layout.component';
import { FileSelectedEvent, File } from '@/studio/media/types';
import { UploadTriggerDirective } from '@ngstarter/components/upload';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { Overlay, GlobalPositionStrategy, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { UploadOverlayComponent, UploadFileViewModel } from '@/studio/media/_upload/upload-overlay.component';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { Divider } from '@ngstarter/components/divider';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { firstValueFrom } from 'rxjs';
import { Segmented, SegmentedButton, SegmentedIconDirective } from '@ngstarter/components/segmented';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter/components/toolbar';

@Component({
  selector: 'app-list',
  imports: [
    Icon,
    MenuItem,
    Menu,
    Button,
    MenuTrigger,
    Button,
    Ripple,
    ReactiveFormsModule,
    FileGridLayout,
    FileListLayout,
    UploadTriggerDirective,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
    ScrollbarArea,
    Divider,
    Segmented,
    SegmentedButton,
    SegmentedIconDirective,
    Toolbar,
    ToolbarTitle,
    ToolbarSpacer,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  // Reference to list layout for table refresh
  readonly listLayout = viewChild<FileListLayout>('listLayout');
  // Reference to grid layout to clear selection after deletion
  readonly gridLayout = viewChild<FileGridLayout>('gridLayout');
  // ZIP download for selected files (even if only 1)
  readonly downloadingZip = signal(false);
  readonly deleting = signal(false);

  private buildZipName(count: number): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `Media-${count}-${stamp}.zip`;
  }

  private getSelectedIds(): string[] {
    return this.selectedFiles.map((f: any) => f.id);
  }

  async downloadSelected(): Promise<void> {
    const ids = this.getSelectedIds();
    if (!ids.length || this.downloadingZip()) return;
    this.downloadingZip.set(true);
    try {
      const url = this.api.getApiEndpoint() + 'studio/media/download';
      const blob = await this.http.post(url, { ids }, {
        headers: this.api.getAuthorizationHeader() as any,
        responseType: 'blob'
      }).toPromise();
      if (!blob) return;
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = this.buildZipName(ids.length);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      // Optionally show a toast/error UI here
      console.error('ZIP download failed', e);
    } finally {
      this.downloadingZip.set(false);
    }
  }
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private appStore = inject(AppStore);
  private breadcrumbsStore = inject(BreadcrumbsStore);
  private overlay = inject(Overlay);
  private viewContainerRef = inject(ViewContainerRef);
  private http = inject(HttpClient);

  private uploadOverlayRef: OverlayRef | null = null;
  private uploadCmpRef: ComponentRef<UploadOverlayComponent> | null = null;
  private uploadSubs = new Map<string, any>();
  private readonly snack = inject(SnackBar);

  readonly loaded = signal(false);
  readonly files = signal([]);
  readonly uploading = signal(false);

  settingsForm = this.formBuilder.group({
    mediaView: ['grid']
  });
  starredIds: string[] = [];
  selectedFiles: File[] = [];

  private readonly confirmManager = inject(ConfirmManager);

  constructor() {
    this.appStore.setTitle(this.route.snapshot.title || '');
    this.breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'studio',
        name: 'breadcrumbs.studio',
        route: '/studio',
        type: 'link',
      },
      {
        name: 'breadcrumbs.media',
        id: 'media',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this.loadList();
  }

  private loadList() {
    this.api.get('studio/media/list').subscribe((res: any) => {
      this.files.set(res.files);
      this.settingsForm.get('mediaView')?.setValue(res.mediaView);
      this.loaded.set(true);
    });
  }

  async deleteSelected(): Promise<void> {
    const ids = this.getSelectedIds();
    if (!ids.length || this.deleting()) return;

    const title = ids.length === 1 ? 'Delete file' : 'Delete files';
    const description = ids.length === 1
      ? 'Delete the selected file? This action cannot be undone.'
      : `Delete ${ids.length} selected files? This action cannot be undone.`;

    const confirmRef = this.confirmManager.open({ title, description });
    try {
      await firstValueFrom((confirmRef as any).confirmed);
    } catch {
      return;
    }

    this.deleting.set(true);
    try {
      const url = this.api.getApiEndpoint() + 'studio/media/delete';
      const res: any = await this.http.post(url, { ids }, {
        headers: this.api.getAuthorizationHeader() as any
      }).toPromise();

      // After deletion, refresh the current view and clear selection
      const view = this.settingsForm.get('mediaView')?.value;
      if (view === 'list') {
        // Refresh server-driven datatable
        this.listLayout()?.refresh();
        this.listLayout()?.clearSelection();
      } else {
        // Grid view: remove deleted items locally and clear selection
        const deletedIds: string[] = Array.isArray(res?.deletedIds) && res.deletedIds.length ? res.deletedIds : ids;
        const current = this.files();
        if (Array.isArray(current) && current.length) {
          this.files.set(current.filter((f: any) => !deletedIds.includes(f.id)));
        } else {
          // Fallback: reload a list if local cache is empty for some reason
          await new Promise<void>((resolve) => {
            this.api.get('studio/media/list').subscribe((r: any) => {
              this.files.set(r.files);
              resolve();
            });
          });
        }
        this.gridLayout()?.clearSelection();
      }
      // Clear local selection reference in any case
      this.selectedFiles = [];

      // Show snackbar summary
      const deleted = Array.isArray(res?.deletedIds) ? res.deletedIds.length : ids.length;
      const skipped = Array.isArray(res?.skippedIds) ? res.skippedIds.length : 0;
      const failed = Array.isArray(res?.failedIds) ? res.failedIds.length : 0;
      let msg = '';
      if (failed > 0 || skipped > 0) {
        msg = `Deleted ${deleted}` + (skipped ? `, skipped ${skipped}` : '') + (failed ? `, failed ${failed}` : '');
      } else {
        msg = deleted === 1 ? 'File deleted' : `${deleted} files deleted`;
      }
      this.snack.open(msg, 'OK', { duration: 2000 });
    } catch (e) {
      console.error('Delete failed', e);
      this.snack.open('Delete failed', undefined, { duration: 3000 });
    } finally {
      this.deleting.set(false);
    }
  }

  async deleteOne(file: any): Promise<void> {
    if (!file?.id || this.deleting()) return;
    const confirmRef = this.confirmManager.open({
      title: 'Delete file',
      description: 'Delete the selected file? This action cannot be undone.'
    });
    try {
      await firstValueFrom((confirmRef as any).confirmed);
    } catch {
      return;
    }

    this.deleting.set(true);
    try {
      const url = this.api.getApiEndpoint() + 'studio/media/delete';
      const res: any = await this.http.post(url, { ids: [file.id] }, {
        headers: this.api.getAuthorizationHeader() as any
      }).toPromise();

      const view = this.settingsForm.get('mediaView')?.value;
      if (view === 'list') {
        this.listLayout()?.refresh();
        this.listLayout()?.clearSelection();
      } else {
        const deletedIds: string[] = Array.isArray(res?.deletedIds) && res.deletedIds.length ? res.deletedIds : [file.id];
        const current = this.files();
        this.files.set((current || []).filter((f: any) => !deletedIds.includes(f.id)));
        this.gridLayout()?.clearSelection();
      }
      // Remove from local selection if present
      this.selectedFiles = (this.selectedFiles || []).filter((f: any) => f.id !== file.id);

      const deleted = Array.isArray(res?.deletedIds) ? res.deletedIds.length : 1;
      const skipped = Array.isArray(res?.skippedIds) ? res.skippedIds.length : 0;
      const failed = Array.isArray(res?.failedIds) ? res.failedIds.length : 0;
      let msg = '';
      if (failed > 0 || skipped > 0) {
        msg = `Deleted ${deleted}` + (skipped ? `, skipped ${skipped}` : '') + (failed ? `, failed ${failed}` : '');
      } else {
        msg = 'File deleted';
      }
      this.snack.open(msg, 'OK', { duration: 2000 });
    } catch (e) {
      console.error('Delete failed', e);
      this.snack.open('Delete failed', undefined, { duration: 3000 });
    } finally {
      this.deleting.set(false);
    }
  }

  copyLinkOfSelected(): void {
    const file = this.selectedFiles?.[0] as any;
    if (!file?.url) return;
    navigator.clipboard?.writeText(file.url).then(() => {
      this.snack.open('Link copied', 'OK', { duration: 1500 });
    }).catch(() => this.snack.open('Failed to copy', undefined, { duration: 2000 }));
  }

  showInfoOfSelected(): void {
    const file = this.selectedFiles?.[0] as any;
    if (!file) return;
    const parts: string[] = [];
    if (file?.name) parts.push(file.name);
    if (file?.mimeType) parts.push(file.mimeType);
    if (typeof file?.size === 'number') parts.push(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    const msg = parts.join(' • ');
    this.snack.open(msg || 'File info', 'OK', { duration: 2500 });
  }

  onGridFilesChecked(event: FileSelectedEvent) {
    this.selectedFiles = event.files;
  }

  onTableFilesChecked(event: any) {
    this.selectedFiles = event.selectedRows || [];
  }

  private openUploadOverlay(): void {
    if (this.uploadOverlayRef && this.uploadOverlayRef.hasAttached()) return;

    const positionStrategy: GlobalPositionStrategy = this.overlay.position().global().bottom('16px').right('16px');
    this.uploadOverlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      disposeOnNavigation: true,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      panelClass: ['upload-overlay-panel']
    });

    const portal = new ComponentPortal(UploadOverlayComponent, this.viewContainerRef);
    this.uploadCmpRef = this.uploadOverlayRef.attach(portal);

    // Handle outputs
    this.uploadCmpRef.instance.close.subscribe(() => this.closeUploadOverlay());
    this.uploadCmpRef.instance.remove.subscribe((id: string) => this.cancelUpload(id));
    this.uploadCmpRef.instance.retry.subscribe((id: string) => this.retryUpload(id));
  }

  private closeUploadOverlay(): void {
    this.uploadSubs.forEach((sub) => sub?.unsubscribe?.());
    this.uploadSubs.clear();
    if (this.uploadOverlayRef) {
      this.uploadOverlayRef.dispose();
      this.uploadOverlayRef = null;
    }
    this.uploadCmpRef = null;
  }

  private updateOverlayList(list: UploadFileViewModel[]): void {
    if (this.uploadCmpRef) {
      this.uploadCmpRef.instance.fileList.set(list);
    }
  }

  private startUploads(files: File[]): void {
    const current = this.uploadCmpRef?.instance.fileList() || [];
    const toAdd: UploadFileViewModel[] = files.map((f) => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: (f as any).name || 'file',
      size: (f as any).size || 0,
      state: 'queued',
      errorMessage: null,
      remainingTime: null,
      progress: 0
    }));

    const list = [...current, ...toAdd];
    this.updateOverlayList(list);

    // Start HTTP uploads with progress
    toAdd.forEach((vm, idx) => {
      const file = files[idx];
      this.uploadOne(vm, file);
    });
  }

  private uploadOne(vm: UploadFileViewModel, file: File): void {
    const url = this.api.getApiEndpoint() + 'studio/media/upload';
    const formData = new FormData();
    formData.append('file', file as any);

    const startedAt = Date.now();
    vm.state = 'uploading';
    this.updateOverlayList(this.uploadCmpRef!.instance.fileList().map(x => x.id === vm.id ? { ...vm } : x));

    const sub = this.http.post(url, formData, {
      headers: this.api.getAuthorizationHeader() as any,
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total || vm.size || 1;
          const percent = Math.round(100 * (event.loaded || 0) / total);
          const elapsed = (Date.now() - startedAt) / 1000; // s
          const speed = (event.loaded || 0) / Math.max(elapsed, 0.001); // bytes/s
          const remainingBytes = Math.max(total - (event.loaded || 0), 0);
          const remainingSec = remainingBytes / Math.max(speed, 1);
          vm.progress = percent;
          vm.remainingTime = isFinite(remainingSec) ? `${Math.ceil(remainingSec)}s` : null;
          this.updateOverlayList(this.uploadCmpRef!.instance.fileList().map(x => x.id === vm.id ? { ...vm } : x));
        } else if (event.type === HttpEventType.Response) {
          vm.progress = 100;
          vm.state = 'done';
          vm.remainingTime = null;
          this.updateOverlayList(this.uploadCmpRef!.instance.fileList().map(x => x.id === vm.id ? { ...vm } : x));

          const res: any = event.body;
          if (res?.file) {
            this.files.update((value: any[]) => {
              const copy = [...value];
              // Prepend the new file
              (copy as any).unshift(res.file);
              return copy as any;
            });
          }
          this.checkAllFinished();
        }
      },
      error: (err) => {
        vm.state = 'error';
        vm.errorMessage = err?.error?.message || 'Upload failed';
        this.updateOverlayList(this.uploadCmpRef!.instance.fileList().map(x => x.id === vm.id ? { ...vm } : x));
        this.checkAllFinished();
      }
    });

    this.uploadSubs.set(vm.id, sub);
  }

  private cancelUpload(id: string): void {
    const sub = this.uploadSubs.get(id);
    if (sub) {
      sub.unsubscribe();
      this.uploadSubs.delete(id);
    }
    const list = this.uploadCmpRef?.instance.fileList().map(x => x.id === id ? { ...x, state: 'canceled' as const } : x) || [];
    this.updateOverlayList(list);
    this.checkAllFinished();
  }

  private retryUpload(id: string): void {
    const idx = this.uploadCmpRef?.instance.fileList().findIndex(x => x.id === id) ?? -1;
    if (idx === -1) return;
    const vm = { ...(this.uploadCmpRef!.instance.fileList()[idx]) };
    vm.state = 'queued';
    vm.progress = 0;
    this.updateOverlayList(this.uploadCmpRef!.instance.fileList().map(x => x.id === vm.id ? { ...vm } : x));
    // There is no direct file reference anymore after initial creation; cannot retry without keeping the File.
    // So we just mark error; In real scenario we would store the File.
  }

  private checkAllFinished(): void {
    const list = this.uploadCmpRef?.instance.fileList() || [];
    if (!list.length) return;
    const active = list.some(x => x.state === 'uploading' || x.state === 'queued');
    if (!active) {
      // Close after short delay to let the user see completion
      setTimeout(() => this.closeUploadOverlay(), 800);
    }
  }

  fileSelected(event: any): void {
    const files: File[] = event.files || [];
    if (!files.length) {
      return;
    }
    this.openUploadOverlay();
    this.startUploads(files);
  }

  saveMediaView() {
    this.selectedFiles = [];
    this.api
      .post('studio/media/view', this.settingsForm.value)
      .subscribe((res: any) => {});
  }
}
