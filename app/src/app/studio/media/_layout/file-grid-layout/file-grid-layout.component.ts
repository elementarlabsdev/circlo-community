import { Component, inject, input, InputSignal, OnInit, output } from '@angular/core';
import { File, FileSelectedEvent } from '../../types';
import { Option } from '@ngstarter-ui/components/autocomplete';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { Divider } from '@ngstarter-ui/components/divider';
import { Menu, MenuHeading, MenuItem, MenuOptionGroupDirective, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Checkbox, CheckboxChange } from '@ngstarter-ui/components/checkbox';
import { Ripple } from '@ngstarter-ui/components/core';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { FormatFileSizePipe } from '@ngstarter-ui/components/core';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import {
  EmptyState,
  EmptyStateContent, EmptyStateIcon
} from '@ngstarter-ui/components/empty-state';
import { Icon } from '@ngstarter-ui/components/icon';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-file-grid-layout',
  imports: [
    Option,
    ReactiveFormsModule,
    Icon,
    Button,
    Divider,
    MenuTrigger,
    Checkbox,
    Ripple,
    MenuItem,
    Menu,
    Tooltip,
    FormatFileSizePipe,
    ImageProxyPipe,
    EmptyState,
    EmptyStateContent,
    EmptyStateIcon,
    Icon,
    MenuOptionGroupDirective,
    MenuHeading,
  ],
  templateUrl: './file-grid-layout.component.html',
  styleUrl: './file-grid-layout.component.scss'
})
export class FileGridLayout implements OnInit {
  private _fb = inject(FormBuilder);
  private document = inject(DOCUMENT);
  private snack = inject(SnackBar);
  private http = inject(HttpClient);
  private api = inject(ApiService);

  starredIds= input<string[]>([]);
  files: InputSignal<File[]> = input.required<File[]>();

  readonly fileSelected = output<FileSelectedEvent>();
  readonly requestDelete = output<File>();

  form: FormGroup;
  selectionModel!: SelectionModel<string>;
  starredModel!: SelectionModel<string>;
  groupByList = [
    {
      id: 'name',
      name: 'Name'
    },
    {
      id: 'modified',
      name: 'Modified'
    },
    {
      id: 'type',
      name: 'Type'
    },
    {
      id: 'extension',
      name: 'Extension'
    },
    {
      id: 'size',
      name: 'Size'
    }
  ];
  sortBy: string = 'asc';

  get groupByName(): string {
    return <string>this.groupByList.find(groupItem => groupItem.id === this.form.value['groupBy'])?.name;
  }

  private buildZipName(count: number): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `Media-${count}-${stamp}.zip`;
  }

  constructor() {
    this.form = this._fb.group({
      groupBy: ['name']
    });
  }

  ngOnInit() {
    this.selectionModel = new SelectionModel<string>(true, []);
    this.starredModel = new SelectionModel<string>(true, this.starredIds());
  }

  // Clears the grid selection and notifies parent
  clearSelection(): void {
    this.selectionModel.clear();
    this.fileSelected.emit({ files: [] });
  }

  sort() {
    this.sortBy = this.sortBy === 'asc' ? 'desc' : 'asc';
  }

  preventDefault(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  copyLink(event: MouseEvent, file: File) {
    this.preventDefault(event);
    if (!file?.url) return;
    navigator.clipboard?.writeText(file.url).then(() => {
      this.snack.open('Link copied', 'OK', { duration: 1500 });
    }).catch(() => {
      this.snack.open('Failed to copy', undefined, { duration: 2000 });
    });
  }

  showInfo(event: MouseEvent, file: File) {
    this.preventDefault(event);
    const parts: string[] = [];
    if (file?.name) parts.push(file.name);
    if (file?.mimeType) parts.push(file.mimeType);
    if (typeof file?.size === 'number') parts.push(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    const msg = parts.join(' • ');
    this.snack.open(msg || 'File info', 'OK', { duration: 2500 });
  }

  async download(file: File): Promise<void> {
    if (!file?.id) return;
    try {
      const url = this.api.getApiEndpoint() + 'studio/media/download';
      const blob = await this.http.post(url, { ids: [file.id] }, {
        headers: this.api.getAuthorizationHeader() as any,
        responseType: 'blob'
      }).toPromise();
      if (!blob) return;
      const a = this.document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = this.buildZipName(1);
      a.style.display = 'none';
      this.document.body.appendChild(a);
      a.click();
      this.document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error('Download failed', e);
      this.snack.open('Download failed', undefined, { duration: 2000 });
    }
  }

  toggleCheck(event: CheckboxChange, fileId: string): void {
    if (event.checked) {
      this.selectionModel.select(fileId);
    } else {
      this.selectionModel.deselect(fileId);
    }

    this.fileSelected.emit({
      files: this.files().filter(file => this.selectionModel.selected.includes(file.id))
    })
  }

  toggleStar(fileId: string): void {
    if (!this.starredModel.isSelected(fileId)) {
      this.starredModel.select(fileId);
    } else {
      this.starredModel.deselect(fileId);
    }
  }
}
