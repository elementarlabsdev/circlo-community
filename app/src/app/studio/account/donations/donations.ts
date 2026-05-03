import { CdkDrag, CdkDragHandle, CdkDropList, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { Icon } from '@ngstarter-ui/components/icon';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { ApiService } from '@services/api.service';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-donations',
  imports: [
    ReactiveFormsModule,
    Button,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    ScrollbarArea,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
    Icon,
    Input,
    FormField,
    Label
  ],
  templateUrl: './donations.html',
  styleUrl: './donations.scss',
})
export class Donations implements OnInit {
  private _api = inject(ApiService);
  private _fb = inject(FormBuilder);
  private _snack = inject(SnackBar);
  private _breadcrumbs = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);

  loaded = signal(false);
  items = signal<any[]>([]);

  form = this._fb.group({
    urls: this._fb.array([] as any[]),
  });

  get urls(): FormArray {
    return this.form.get('urls') as FormArray;
  }

  constructor() {
    this._breadcrumbs.setBreadcrumbs([
      { id: 'home', type: 'link', route: '/', iconName: 'fluent:home-24-regular' },
      { id: 'studio', name: 'breadcrumbs.studio', type: 'link', route: '/studio' },
      { id: 'account', name: 'breadcrumbs.account', type: 'link', route: '/studio/account' },
      { id: 'donations', name: 'breadcrumbs.account.donations', type: null },
    ]);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this._api.get<any[]>('studio/account/donations').subscribe((res) => {
      this.items.set(res || []);
      this.loaded.set(true);
      this.fillFormFromItems();
    });
  }

  private fillFormFromItems(): void {
    this.urls.clear();
    for (const it of this.items()) {
      this.urls.push(this._fb.group({ id: [it.id], url: [it.url, [Validators.required, this.urlValidator]] }));
    }
  }

  urlValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').trim();
    if (!value) return null;
    if (!/^https?:\/\//i.test(value)) return { url: true };
    try {
      // eslint-disable-next-line no-new
      new URL(value);
      return null;
    } catch {
      return { url: true };
    }
  };

  submit(): void {
    if (this.form.invalid) return;
    const controls = this.urls.controls as any[];
    const items = controls.map((ctrl) => ({ id: ctrl.get('id')?.value, url: ctrl.get('url')?.value }));
    this._api.post<any[]>('studio/account/donations/batch', { items }).subscribe((res) => {
      const sorted = Array.isArray(res) ? res : [];
      this.items.set(sorted);
      this.fillFormFromItems();
      this._snack.open('Saved', '', { duration: 2000 });
    });
  }

  add(): void {
    this.urls.push(this._fb.group({ id: [null], url: ['', [Validators.required, this.urlValidator]] }));
  }

  remove(item: any, idx?: number): void {
    if (typeof idx === 'number') {
      this.urls.removeAt(idx);
      const arr = [...this.items()];
      arr.splice(idx, 1);
      this.items.set(arr);
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    const controls = (this.urls.controls as any[]);
    moveItemInArray(controls, event.previousIndex, event.currentIndex);
    const reordered = [...controls];
    this.urls.clear();
    reordered.forEach((c) => this.urls.push(c));
    const arr = [...this.items()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.items.set(arr);
  }
}
