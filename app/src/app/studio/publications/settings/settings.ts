import { Component, DestroyRef, ElementRef, inject, model, OnInit, signal, viewChild } from '@angular/core';
import { ChipGrid, ChipInput, ChipInputEvent, ChipRemove, ChipRow } from '@ngstarter-ui/components/chips';
import { Channel, Publication, Topic } from '@model/interfaces';
import {
  Autocomplete,
  AutocompleteSelectedEvent,
  AutocompleteTrigger,
  Option
} from '@ngstarter-ui/components/autocomplete';
import { EditComponent } from '@/studio/publications/edit/edit.component';
import { PUBLICATION_EDIT_ROOT } from '@/studio/publications/types';
import { ApiService } from '@services/api.service';
import findRecursive from '@/_utils/find-recursive';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from '@ngstarter-ui/components/icon';
import { Checkbox, CheckboxGroup } from '@ngstarter-ui/components/checkbox';
import { Input } from '@ngstarter-ui/components/input';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { debounceTime } from 'rxjs';
import { Optgroup, Select } from '@ngstarter-ui/components/select';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';

@Component({
  imports: [
    Button,
    Icon,
    ReactiveFormsModule,
    TranslocoPipe,
    AutocompleteTrigger,
    ChipInput,
    ChipRemove,
    ChipRow,
    ChipGrid,
    Label,
    FormField,
    Option,
    Autocomplete,
    Checkbox,
    Hint,
    Input,
    Panel,
    PanelContent,
    ScrollbarArea,
    PanelHeader,
    Button,
    Optgroup,
    Select,
    CheckboxGroup,
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {
  private editRoot = inject<EditComponent>(PUBLICATION_EDIT_ROOT);
  private api = inject(ApiService);
  private formBuilder = inject(FormBuilder);
  private dialog = inject(Dialog);
  private destroyRef = inject(DestroyRef);
  private snackBar = inject(SnackBar);

  topicInput = viewChild.required<ElementRef<HTMLInputElement>>('topicInput');

  separatorKeysCodes: number[] = [ENTER, COMMA];
  form = this.formBuilder.group({
    authorId: ['', [Validators.required]],
    licenseTypeId: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    channelId: [''],
    metaTitle: [''],
    metaDescription: [''],
    topics: [[]],
    canonicalUrl: [''],
    discussionEnabled: [false],
    pinned: [false]
  });
  topicNameControl = new FormControl('');
  channelSearchControl = new FormControl('');

  saving = signal(false);
  allTopics = signal<Topic[]>([]);
  filteredTopics = signal<Topic[]>([]);
  channels = signal<Channel[]>([]);
  filteredChannels = signal<Channel[]>([]);
  openAIApiKey = signal('');
  licenseTypes = signal<any[]>([]);
  publication = signal<Publication | null>(null);
  featureImageBackgroundColor = model('#fef9c3');
  textColor = model('#000');
  loaded = signal(false);

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
      .get(`studio/publication/edit/${this.editRoot.publicationHash()}`)
      .subscribe((res: any) => {
        this.openAIApiKey.set(res.openAIApiKey);
        this.form.setValue({
          channelId: res.publication.channel?.id || null,
          slug: res.publication.slug,
          metaTitle: res.publication.metaTitle,
          metaDescription: res.publication.metaDescription,
          topics: res.publication.topics,
          canonicalUrl: res.publication.canonicalUrl,
          discussionEnabled: res.publication.discussionEnabled,
          authorId: res.publication.author.id,
          pinned: res.publication.pinned,
          licenseTypeId: res.publication.licenseType.id
        });
        this.publication.set(res.publication);
        this.allTopics.set(res.allTopics);
        this.filteredTopics.set(res.allTopics);
        // Prefer fetching only public channels for autocomplete field
        // Fallback to provided channels if separate request fails later
        this.channels.set(res.channels || []);
        this.filteredChannels.set(res.channels || []);
        this.licenseTypes.set(res.licenseTypes);
        // initialize topic filtering updates
        this.topicNameControl.valueChanges.subscribe((value) => {
          const v = (value || '').toString().trim().toLowerCase();
          const list = this.allTopics().filter(t => !v || t.name.toLowerCase().includes(v));
          this.filteredTopics.set(list);
        });
        // Initialize channel autocomplete: load public channels and set up client filtering
        this.api.get<any>(`channels`).subscribe((listRes) => {
          const items = (listRes?.items || []) as Channel[];
          if (items.length) {
            this.channels.set(items);
            this.filteredChannels.set(items);
          }
          // Pre-fill search input with current channel name if any
          const current = (this.publication() || null)?.channel || null;
          if (current) {
            this.channelSearchControl.setValue(current.name, { emitEvent: false });
          }
        });
        this.channelSearchControl.valueChanges
          .pipe(debounceTime(150))
          .subscribe((value) => {
            const v = (value || '').toString().trim().toLowerCase();
            const list = this.channels().filter((c) => !v || c.name.toLowerCase().includes(v));
            this.filteredChannels.set(list);
          });
        this.loaded.set(true);
      })
    ;
  }

  addTopic(event: ChipInputEvent): void {
    const pub = this.publication();
    if (!pub) {
      return;
    }
    if (pub.topics.length >= 6) {
      return;
    }

    const value = (event.value || '').trim();

    if (value) {
      const existingTopic = this.allTopics().find(_ => _.name.toLowerCase() === value.toLowerCase());

      if (!existingTopic) {
        const newTopic: Topic = {
          id: crypto.randomUUID(),
          slug: crypto.randomUUID(),
          name: value,
          logoUrl: '',
          description: '',
          publicationsCount: 0,
          tutorialsCount: 0,
          followersCount: 0
        };
        this.allTopics.update(list => [...list, newTopic]);
        this.publication.update(p => p ? {...p, topics: [...p.topics, newTopic]} as Publication : p);
      } else {
        const publicationTopicsIndex = pub.topics.findIndex(
          _ => _.name.toLowerCase() === value.toLowerCase()
        );

        if (publicationTopicsIndex === -1) {
          this.publication.update(p => p ? {...p, topics: [...p.topics, existingTopic]} as Publication : p);
        }
      }

      // @ts-ignore
      this.form.get('topics')?.setValue(this.publication()?.topics || []);
    }

    event.chipInput!.clear();
    this.topicNameControl.setValue(null);
  }

  removeTopic(topic: Topic): void {
    const pub = this.publication();
    if (!pub) {
      return;
    }
    const publicationTopicsIndex = pub.topics.findIndex(_ => _.id === topic.id);

    if (publicationTopicsIndex >= 0) {
      const updated = [...pub.topics.slice(0, publicationTopicsIndex), ...pub.topics.slice(publicationTopicsIndex + 1)];
      this.publication.set({...pub, topics: updated});
      // @ts-ignore
      this.form.get('topics')?.setValue(updated);
    }
  }

  topicSelected(event: AutocompleteSelectedEvent): void {
    const pub = this.publication();
    if (!pub) {
      return;
    }
    const selectedTopic = event.option.value() as Topic;
    const publicationTopicsIndex = pub.topics.findIndex(_ => _.id === selectedTopic.id);

    if (publicationTopicsIndex === -1) {
      const updated = [...pub.topics, selectedTopic];
      this.publication.set({...pub, topics: updated});
      // @ts-ignore
      this.form.get('topics')?.setValue(updated);
    }

    this.topicInput().nativeElement.value = '';
    this.topicNameControl.setValue(null);
  }

  get topics(): string {
    const topics: any = this.form.value.topics;
    return topics.map((topic: any) => topic.name).join(', ');
  }

  channelSelected(event: AutocompleteSelectedEvent): void {
    const selected: Channel = event.option.value() as unknown as Channel;
    const pub = this.publication();
    if (pub) {
      this.publication.set({ ...pub, channel: selected });
    }
    this.form.get('channelId')?.setValue(selected?.id || null);
  }

  clearChannel(): void {
    const pub = this.publication();
    if (pub) {
      this.publication.set({ ...pub, channel: null });
    }
    this.form.get('channelId')?.setValue(null);
    this.channelSearchControl.setValue('', { emitEvent: true });
  }

  // Used by ngs-autocomplete to render selected value inside input
  displayChannel = (c: Channel | string | null): string => {
    if (!c) return '';
    if (typeof c === 'string') return c;
    return c.name ?? '';
  };

  save() {
    this.saving.set(true);
    this.editRoot.saving.set(true);
    this.api
      .post(`studio/publication/edit/${this.editRoot.publicationHash()}/settings`, this.form.value)
      .subscribe((res: any) => {
        this.publication.set(res.publication);
        this.editRoot.publication.set(res.publication);
        this.saving.set(false);
        this.editRoot.saving.set(false);
        this.snackBar.open('Settings saved', 'Close', { duration: 3000 });
      }, (error) => {
        this.saving.set(false);
        this.editRoot.saving.set(false);
        this.snackBar.open('Error saving settings', 'Close', { duration: 3000 });
      });
  }
}
