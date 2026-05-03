import { Component, inject, OnInit, signal } from '@angular/core';
import {  Button } from '@ngstarter-ui/components/button';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppStore } from '@store/app.store';
import { ApiService } from '@services/api.service';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelTitle
} from '@ngstarter-ui/components/expansion';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { UploadFileSelectedEvent, UploadTriggerDirective } from '@ngstarter-ui/components/upload';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Menu } from '@model/interfaces';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslateService } from '@services/translate.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  imports: [

    Button,
    ReactiveFormsModule,
    RouterLink,
    FormField,
    Input,
    Label,
    ExpansionPanelTitle,
    Accordion,
    ExpansionPanelHeader,
    ExpansionPanel,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    SlideToggle,
    UploadTriggerDirective,
    ImageProxyPipe,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoModule
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private _appStore = inject(AppStore);
  private _api = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _translate = inject(TranslateService);

  loaded = signal(false);
  saving = signal(false);
  menu: Menu;
  form: FormGroup;

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
  }

  ngOnInit() {
    const id = this._route.snapshot.params['id'];
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'admin',
        route: '/admin',
        name: this._translate.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'menu',
        name: this._translate.instant('breadcrumbs.menu'),
        type: 'link',
        route: '/admin/menus',
      },
      {
        id: 'menu-action',
        name: id ? this._translate.instant('breadcrumbs.menu.edit') : this._translate.instant('breadcrumbs.menu.new'),
        type: null
      }
    ]);

    if (id) {
      this._api
        .get(`admin/menus/${id}`)
        .subscribe((res: any) => {
          this.menu = res;
          this.form = this.initForm(this.menu);
          this.loaded.set(true);
        });
    } else {
      this.form = this.initForm();
      this.loaded.set(true);
    }
  }

  initForm(menu?: Menu): FormGroup {
    return this._formBuilder.group({
      name: [menu?.name || '', Validators.required],
      items: this._formBuilder.array((menu?.items || []).map((item: any) => {
        return this._formBuilder.group({
          id: [item.id, Validators.required],
          name: [item.name, Validators.required],
          url: [item.url, Validators.required],
          position: [item.position, Validators.required],
          authorisedOnly: [item.authorisedOnly, Validators.required],
          iconUrl: [item.iconUrl],
        })
      }))
    });
  }

  get itemsFormArray(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get items(): any[] {
    return this.itemsFormArray.controls;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    this.items.forEach((item, index: number) => {
      item.get('position').setValue(index);
    });
  }

  addNewLink() {
    this.itemsFormArray.push(
      this._formBuilder.group({
        id: [crypto.randomUUID()],
        name: ['Menu link ' + (this.items.length + 1), Validators.required],
        url: ['menu-link-url-' + (this.items.length + 1), Validators.required],
        position: [this.items.length + 1, Validators.required],
        authorisedOnly: [false, Validators.required],
        iconUrl: [''],
      })
    );
  }

  deleteLink(item: any, index: number) {
    this.itemsFormArray.removeAt(index);
  }

  save() {
    this.saving.set(true);
    const id = this.menu?.id;
    const request = id
      ? this._api.post(`admin/menus/${id}`, this.form.value)
      : this._api.post(`admin/menus`, this.form.value);

    request.subscribe({
      next: (res: any) => {
        this.saving.set(false);
        this._snackBar.open(this._translate.instant(id ? 'admin.menu.edit.saved' : 'admin.menu.create.saved'), '', {
          duration: 3000
        });
        if (!id) {
          this._router.navigate(['/admin/menus', res.id, 'edit']);
        }
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  iconSelected(event: UploadFileSelectedEvent, item: FormGroup): void {
    const formData = new FormData();
    formData.append('image', event.files[0]);
    this._api
      .post(`admin/menus/link/icon/upload`, formData)
      .subscribe((res: any) => {
        item.get('iconUrl')?.setValue(res.url);
      })
    ;
  }

  removeIconUrl(item: FormGroup): void {
    item.get('iconUrl')?.setValue('');
  }
}
