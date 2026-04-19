import {
  Component, DestroyRef,
  ElementRef,
  forwardRef, inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { githubLight } from '@uiw/codemirror-theme-github';
import { indentWithTab } from '@codemirror/commands';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { LESSON_EDITOR_BLOCK } from '../../types';
import {
  LessonBuilderCommunicatorService
} from '../../lesson-builder-communicator.service';
import { CodeBlockData, LessonBlock } from '../../../models/lesson-block.model';
import {
  LessonBuilderComponent
} from '../../lesson-builder/lesson-builder.component';
import { codeLanguages } from '../../../models/code-block.model';

@Component({
  selector: 'app-code-block',
  providers: [
    {
      provide: LESSON_EDITOR_BLOCK,
      multi: true,
      useExisting: forwardRef(() => CodeBlockComponent)
    }
  ],
  templateUrl: './code-block.component.html',
  styleUrl: './code-block.component.scss'
})
export class CodeBlockComponent {
  private communicator = inject(LessonBuilderCommunicatorService);
  private destroyRef = inject(DestroyRef);

  block = input.required<LessonBlock<CodeBlockData>>();
  builder = input.required<LessonBuilderComponent>();

  private _contentRef = viewChild.required<ElementRef<HTMLParagraphElement>>('contentRef');
  private languageLibraryMap = {
    angular: () => import('@codemirror/lang-angular').then(lang => lang.angular()),
    javascript: () => import('@codemirror/lang-javascript').then(lang => lang.javascript()),
    typescript: () => import('@codemirror/lang-javascript').then(lang => lang.javascript({ typescript: true })),
    html: () => import('@codemirror/lang-html').then(lang => lang.html()),
    css: () => import('@codemirror/lang-css').then(lang => lang.css()),
    sass: () => import('@codemirror/lang-sass').then(lang => lang.sass()),
    json: () => import('@codemirror/lang-json').then(lang => lang.json()),
  } as const;
  protected _code = signal<string>('');
  protected _isEmpty = signal<boolean>(true);

  private _editorView!: EditorView;
  private _editorLanguage = new Compartment();
  readonly initialized = signal(false);

  protected languages = codeLanguages;

  async ngOnInit() {
    this._code.set(this.block().data.content || '');
    this._isEmpty.set(this._code().length === 0);
    this._editorView = new EditorView({
      doc: this._code(),
      parent: this._contentRef().nativeElement,
      extensions: [
        basicSetup,
        githubLight,
        keymap.of([indentWithTab]),
        this._editorLanguage.of([]),
        EditorView.updateListener.of((v:any) => {
          if (v.docChanged) {
            this.builder().emitChange();
          }
        })
      ]
    });
    await this.loadAndSetLanguage(false);
    this._editorView.contentDOM.style.width = '0';
    this._editorView.focus();
    this.initialized.set(true);
    this.communicator
      .blockDataChanged()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((v: { blockId: any; data: any }) => v.blockId === this.block().id)
      )
      .subscribe((event: { blockId: any; data: any }) => {
        const data = event.data as Partial<CodeBlockData>;
        (Object.keys(data) as (keyof CodeBlockData)[]).forEach((key) => {
          this.block().data[key] = data[key] as any;
        });
        this.loadAndSetLanguage(false);
        this.builder().emitChange();
      });
  }

  get selectedLanguageName() {
    return this.languages.find(l => l.language === this.block().data.language)?.name || 'None';
  }

  ngOnDestroy() {
    this._editorView?.destroy();
  }

  getData(): any {
    return {
      content: this._editorView ? this._editorView.state.doc.toString() : this.block().data.content || '',
      language: this.block().data.language
    };
  }

  isEmpty(): boolean {
    return this.getData().content.trim().length === 0;
  }

  protected async loadAndSetLanguage(emitEvent = true) {
    if (this.block().data.language === 'none') {
      this._editorView.dispatch({
        effects: this._editorLanguage.reconfigure([])
      });
    } else {
      const langKey = this.block().data.language as keyof typeof this.languageLibraryMap;
      const libraryFn = this.languageLibraryMap[langKey];
      const libraryFile = await libraryFn();
      const extension = (libraryFile as any)?.extension ?? libraryFile;
      this._editorView.dispatch({
        effects: this._editorLanguage.reconfigure(extension as any)
      });
    }

    if (emitEvent && this.initialized()) {
      this.builder().emitChange();
    }
  }
}
