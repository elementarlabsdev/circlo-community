import { Component, ElementRef, inject, OnInit, Signal, signal, viewChild } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { ApiService } from '@services/api.service';
import { FormConfig } from '@ngstarter-ui/components/form-renderer';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Button } from '@ngstarter-ui/components/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from '@ngstarter-ui/components/icon';
import {
  UploadAllowedTypes,
  UploadArea,
  UploadAreaDropStateDirective,
  UploadAreaInvalidStateDirective,
  UploadAreaMainStateDirective,
  UploadContainer,
  UploadFileSelectedEvent,
  UploadMaxFileSize,
  UploadTriggerDirective
} from '@ngstarter-ui/components/upload';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  Autocomplete,
  AutocompleteTrigger,
  Option,
  AutocompleteSelectedEvent,
} from '@ngstarter-ui/components/autocomplete';
import { Optgroup } from '@ngstarter-ui/components/option';
import { Select } from '@ngstarter-ui/components/select';
import { Checkbox, CheckboxGroup } from '@ngstarter-ui/components/checkbox';
import { ChipGrid, ChipInput, ChipRemove, ChipRow, ChipInputEvent } from '@ngstarter-ui/components/chips';
import { Input } from '@ngstarter-ui/components/input';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import findRecursive from '@/_utils/find-recursive';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { debounceTime } from 'rxjs';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TextareaAutoSize } from '@ngstarter-ui/components/core';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';

@Component({
  imports: [
    ImageProxyPipe,
    Button,
    Icon,
    TranslocoPipe,
    UploadTriggerDirective,
    UploadAreaMainStateDirective,
    UploadAreaDropStateDirective,
    UploadAreaInvalidStateDirective,
    UploadAllowedTypes,
    UploadMaxFileSize,
    UploadArea,
    UploadContainer,
    Panel,
    PanelHeader,
    PanelContent,
    ScrollbarArea,
    FormsModule,
    Autocomplete,
    AutocompleteTrigger,
    Select,
    Checkbox,
    ChipGrid,
    ChipInput,
    ChipRemove,
    ChipRow,
    FormField,
    Hint,
    Button,
    Input,
    Label,
    Option,
    ReactiveFormsModule,
    DragDropModule,
    Optgroup,
    CheckboxGroup,
    TextareaAutoSize
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(SnackBar);
  readonly data = inject(ROUTER_OUTLET_DATA) as Signal<{tutorialId: string}>;

  readonly loaded = signal(false);
  readonly tutorial = signal<any>(null);
  readonly saving = signal<any>(false);
  readonly featuredImageUploading = signal(false);
  readonly topicInput = viewChild<ElementRef<HTMLInputElement>>('topicInput');
  licenseTypes = signal<any[]>([]);
  config = signal<FormConfig>({
    elements: [],
    layout: {
      columns: 1,
      children: []
    }
  });
  initialValue = signal({
  });
  form = this.formBuilder.group({
    authorId: ['', [Validators.required]],
    licenseTypeId: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    channelId: [''],
    metaTitle: [''],
    metaDescription: [''],
    topics: [[]],
    discussionEnabled: [false],
    pinned: [false],
    whatYouWillLearn: this.formBuilder.array<string>([]),
  });
  topicNameControl = new FormControl('');
  channelSearchControl = new FormControl('');

  // Data sources for topics and channels
  allTopics = signal<any[]>([]);
  filteredTopics = signal<any[]>([]);
  channels = signal<any[]>([]);
  filteredChannels = signal<any[]>([]);

  // Chip separator keys
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  get licenseRules(): any[] {
    const licenseTypeId = this.form.value.licenseTypeId;
    const licenseType = findRecursive<any>(
      this.licenseTypes(), (_: any) => _.id === licenseTypeId
    );

    if (licenseType) {
      let rules = licenseType.rules || [];
      const parent = findRecursive<any>(
        this.licenseTypes(), (_: any) => _.id === licenseType.parentId
      );

      if (parent) {
        rules = [...parent.rules, ...rules];
      }

      return rules;
    }

    return [];
  }

  ngOnInit() {
    this.api
      .get(`studio/tutorials/${this.data().tutorialId}/settings`)
      .subscribe((res: any) => {
        this.tutorial.set(res.tutorial);
        this.initialValue.set(res.tutorial);
        this.config.set(res.formConfig);
        this.form.patchValue({
          channelId: res.tutorial.channel?.id || null,
          slug: res.tutorial.slug,
          metaTitle: res.tutorial.metaTitle,
          metaDescription: res.tutorial.metaDescription,
          topics: res.tutorial.topics,
          discussionEnabled: res.tutorial.discussionEnabled,
          authorId: res.tutorial.author.id,
          pinned: res.tutorial.pinned,
          licenseTypeId: res.tutorial.licenseType.id,
        });
        // Initialize the whatYouWillLearn array from API (array of strings expected)
        const points: string[] = Array.isArray(res.tutorial?.whatYouWillLearn)
          ? res.tutorial.whatYouWillLearn
          : [];
        const fa = this.whatYouWillLearn;
        fa.clear();
        for (const p of points) {
          fa.push(new FormControl(p ?? ''));
        }
        this.licenseTypes.set(res.licenseTypes);
        // Initialize topics list (if backend returns topics universe later, wire here).
        // For now we take current tutorial topics as the starting list.
        this.allTopics.set(res.allTopics ?? res.tutorial.topics ?? []);
        this.filteredTopics.set(this.allTopics());
        this.topicNameControl.valueChanges.subscribe((value) => {
          const v = (value || '').toString().trim().toLowerCase();
          const list = this.allTopics().filter((t: any) => !v || (t.name || '').toLowerCase().includes(v));
          this.filteredTopics.set(list);
        });

        // Load public channels for autocomplete; fall back to tutorial's channel only
        this.api.get<any>('channels').subscribe((listRes) => {
          const items = (listRes?.items || []) as any[];
          if (items.length) {
            this.channels.set(items);
            this.filteredChannels.set(items);
          } else {
            const current = res.tutorial.channel ? [res.tutorial.channel] : [];
            this.channels.set(current);
            this.filteredChannels.set(current);
          }
          // Prefill input with current channel name
          const current = res.tutorial.channel || null;
          if (current?.name) {
            this.channelSearchControl.setValue(current.name, { emitEvent: false });
          }
        });
        this.channelSearchControl.valueChanges
          .pipe(debounceTime(150))
          .subscribe((value) => {
            const v = (value || '').toString().trim().toLowerCase();
            const list = this.channels().filter((c: any) => !v || (c.name || '').toLowerCase().includes(v));
            this.filteredChannels.set(list);
          });

        this.loaded.set(true);
      });
  }

  // FormArray accessor for whatYouWillLearn
  get whatYouWillLearn(): FormArray<FormControl<string | null>> {
    return this.form.get('whatYouWillLearn') as FormArray<FormControl<string | null>>;
  }

  addLearningPoint(): void {
    this.whatYouWillLearn.push(new FormControl(''));
  }

  removeLearningPoint(index: number): void {
    if (index < 0 || index >= this.whatYouWillLearn.length) return;
    this.whatYouWillLearn.removeAt(index);
  }

  dropLearningPoint(event: CdkDragDrop<FormControl[]>) {
    if (!event || event.previousIndex === event.currentIndex) return;
    const arr = this.whatYouWillLearn;
    // Optimistic reordering of FormArray
    const controls = [...arr.controls];
    moveItemInArray(controls, event.previousIndex, event.currentIndex);
    arr.clear();
    for (const c of controls) arr.push(c);
  }

  // Channels autocomplete handlers
  channelSelected(event: AutocompleteSelectedEvent): void {
    const selected = event.option.value();
    const t = this.tutorial();
    if (t) {
      this.tutorial.set({ ...t, channel: selected });
    }
    this.form.get('channelId')?.setValue(selected?.id || null);
  }

  clearChannel(): void {
    const t = this.tutorial();
    if (t) {
      this.tutorial.set({ ...t, channel: null });
    }
    this.form.get('channelId')?.setValue(null);
    this.channelSearchControl.setValue('', { emitEvent: true });
  }

  // Used by ngs-autocomplete to render selected value inside input
  displayChannel = (c: any | string | null): string => {
    if (!c) return '';
    if (typeof c === 'string') return c;
    return c.name ?? '';
  };

  displayTopic = (t: any | string | null): string => {
    if (!t) return '';
    if (typeof t === 'string') return t;
    return t.name ?? '';
  };

  // Topics chips & autocomplete handlers
  addTopic(event: ChipInputEvent): void {
    const value = (event.value || '').trim();
    if (!value || value === 'inputValueFn') return;
    // Prevent more than 6 topics
    if ((this.tutorial()?.topics?.length || 0) >= 6) return;
    const t = this.tutorial();
    const exists = (t?.topics || []).some((x: any) => (x.name || '').toLowerCase() === value.toLowerCase());
    if (!exists) {
      const updated = { ...(t || {}), topics: [...(t?.topics || []), { name: value }] };
      this.tutorial.set(updated);
      this.form.get('topics')?.setValue(updated.topics);
    }
    // Clear input
    event.chipInput?.clear();
    const input = this.topicInput();
    if (input) {
      input.nativeElement.value = '';
    }
    this.topicNameControl.setValue('');
  }

  topicSelected(event: AutocompleteSelectedEvent): void {
    const selected = event.option.value();

    if (!selected) {
      return;
    }

    // Prevent more than 6 topics
    if ((this.tutorial()?.topics?.length || 0) >= 6) {
      return;
    }

    const t = this.tutorial();
    const exists = (t?.topics || []).some((x: any) =>
      (x.id && selected.id && x.id === selected.id) || ((x.name || '').toLowerCase() === (selected.name || '').toLowerCase())
    );

    if (!exists) {
      const updated = { ...(t || {}), topics: [...(t?.topics || []), selected] };
      this.tutorial.set(updated);
      this.form.get('topics')?.setValue(updated.topics);
    }

    // Clear search
    const input = this.topicInput();
    if (input) {
      input.nativeElement.value = '';
    }
    setTimeout(() => {
      this.topicNameControl.setValue('');
    }, 0);
  }

  removeTopic(topic: any): void {
    const t = this.tutorial();
    const list = (t?.topics || []).filter((x: any) => (x.id && topic.id) ? x.id !== topic.id : (x.name || '') !== (topic.name || ''));
    const updated = { ...(t || {}), topics: list };
    this.tutorial.set(updated);
    this.form.get('topics')?.setValue(updated.topics);
  }

  save() {
    this.saving.set(true);
    this.api
      .post(`studio/tutorials/${this.data().tutorialId}/settings`, this.form.value)
      .subscribe((res: any) => {
        this.saving.set(false);
        this.snackBar.open('Settings saved', 'Close', { duration: 3000 });
      }, (error) => {
        this.saving.set(false);
        this.snackBar.open('Error saving settings', 'Close', { duration: 3000 });
      });
  }

  deleteFeaturedImage() {
    this.tutorial().featuredImageUrl = null;
    this.api
      .post(`studio/tutorials/${this.data().tutorialId}/featured-image`, {
        featuredImageUrl: null
      })
      .subscribe((res: any) => {
      });
  }

  onFeatureImageSelected(event: UploadFileSelectedEvent): void {
    this.featuredImageUploading.set(true);
    const file = event.files[0];
    const formData = new FormData();
    formData.append('image', file);
    this.api
      .post('upload/image', formData)
      .subscribe((res: any) => {
        this.tutorial().featuredImageUrl = res.url;
        this.featuredImageUploading.set(false);
        this.api
          .post(`studio/tutorials/${this.data().tutorialId}/featured-image`, {
            featuredImageUrl: this.tutorial().featuredImageUrl
          })
          .subscribe((res: any) => {
          });
      });
  }
}
