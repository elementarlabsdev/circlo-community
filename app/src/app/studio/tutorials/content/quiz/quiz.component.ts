import { Component, Signal, inject, signal, DestroyRef } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { Card, CardAside, CardContent, CardHeader, CardTitle } from '@ngstarter/components/card';
import { RadioButton, RadioGroup } from '@ngstarter/components/radio';
import { Checkbox } from '@ngstarter/components/checkbox';
import { ActivatedRoute, ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { TranslocoPipe } from '@jsverse/transloco';
import { Tooltip } from '@ngstarter/components/tooltip';
import { ApiService } from '@services/api.service';
import { Ripple } from '@ngstarter/components/core';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-quiz',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Button,
    Button,
    Icon,
    FormField,
    Label,
    Input,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    RadioButton,
    Checkbox,
    Panel,
    PanelContent,
    ScrollbarArea,
    PanelHeader,
    TranslocoPipe,
    Tooltip,
    Ripple,
    CardAside
  ],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private activatedRoute = inject(ActivatedRoute);
  readonly data = inject(ROUTER_OUTLET_DATA) as Signal<{ tutorialId: string }>;

  loaded = signal(false);
  readonly saving = signal(false);
  readonly quiz = signal<any>(null);

  private readonly destroy$ = new Subject<void>();
  private initializing = true;

  form = this.fb.group({
    title: this.fb.control<string>(''),
    questions: this.fb.array([] as any[])
  });

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  // Question builders
  addQuestion(type: 'single' | 'multiple' | 'open') {
    const base = this.fb.group({
      type: this.fb.control<'single' | 'multiple' | 'open'>(type, { nonNullable: true }),
      text: this.fb.control<string>('', { validators: [Validators.required] })
    });

    if (type === 'open') {
      this.questions.push(base);
      return;
    }

    const options = this.fb.array([
      this.option(''),
      this.option('')
    ]);

    const correct = type === 'single'
      ? this.fb.control<number | null>(0)
      : this.fb.control<number[]>([]);

    const group = this.fb.group({
      ...base.controls,
      options,
      correct
    });
    this.questions.push(group);
  }

  option(text = '') {
    return this.fb.control<string>(text, { validators: [Validators.required] });
  }

  addOption(qIndex: number) {
    const q = this.questions.at(qIndex) as any;
    q.get('options').push(this.option(''));
  }

  removeOption(qIndex: number, oIndex: number) {
    const q = this.questions.at(qIndex) as any;
    const options: FormArray = q.get('options');
    options.removeAt(oIndex);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  // Reorder helpers
  moveQuestionUp(index: number) {
    if (index <= 0 || index >= this.questions.length) return;
    const ctrl = this.questions.at(index);
    this.questions.removeAt(index);
    this.questions.insert(index - 1, ctrl);
  }

  moveQuestionDown(index: number) {
    if (index < 0 || index >= this.questions.length - 1) return;
    const ctrl = this.questions.at(index);
    this.questions.removeAt(index);
    this.questions.insert(index + 1, ctrl);
  }

  // Selection helpers for template
  selectSingle(index: number, optionIndex: number) {
    const q = this.questions.at(index) as any;
    q.get('correct').setValue(optionIndex);
  }

  toggleMultiple(index: number, optionIndex: number, checked: boolean) {
    const q = this.questions.at(index) as any;
    const ctrl = q.get('correct');
    const arr: number[] = [...(ctrl.value ?? [])];
    const pos = arr.indexOf(optionIndex);
    if (checked && pos === -1) arr.push(optionIndex);
    if (!checked && pos !== -1) arr.splice(pos, 1);
    ctrl.setValue(arr);
  }

  save() {
    this.saving.set(true);
    const quizId = this.activatedRoute.snapshot.params['id'];

    // Build DTO for backend
    const raw: any = this.form.getRawValue();
    const questionsDto = this.questions.controls.map((ctrl: any) => {
      const type = ctrl.get('type')?.value as 'single' | 'multiple' | 'open';
      const text = (ctrl.get('text')?.value ?? '').trim();

      if (type === 'open') {
        // Backend currently supports single/multiple; skip open-ended for now
        return null;
      }

      const optionsArr: string[] = (ctrl.get('options')?.value ?? []).map((t: string) => String(t ?? '').trim());
      const options = optionsArr
        .map((t: string, idx: number) => ({
          text: t,
          isCorrect:
            type === 'single'
              ? (ctrl.get('correct')?.value ?? null) === idx
              : Array.isArray(ctrl.get('correct')?.value)
                ? (ctrl.get('correct')?.value as number[]).includes(idx)
                : false,
        }))
        // filter out completely empty options
        .filter((o: any) => o.text.length > 0);

      return {
        type: type === 'multiple' ? 'multiple' : 'single',
        text,
        options,
      };
    }).filter(Boolean);

    const payload = {
      title: (raw.title ?? '').trim(),
      questions: questionsDto,
    } as any;

    this.api.post(`studio/tutorials/quizzes/${quizId}/content`, payload).subscribe({
      next: () => {
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Failed to save quiz', err);
        this.saving.set(false);
      }
    });
  }

  ngOnInit() {
    // Auto-save on any form change with 400ms debounce
    this.form.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (!this.initializing) {
          this.save();
        }
      });

    const quizId = this.activatedRoute.snapshot.params['id'];
    this.api.get(`studio/tutorials/quizzes/${quizId}`).subscribe((res: any) => {
      const quiz = res.quiz ?? res.data?.quiz ?? res; // be tolerant to shape
      this.quiz.set(quiz);
      // patch heading title
      if (quiz?.name) this.form.controls.title.setValue(quiz.name);

      // rebuild questions from backend data if present
      this.resetQuestions();
      if (Array.isArray(quiz?.questions) && quiz.questions.length) {
        for (const q of quiz.questions) {
          const type = (q.type === 'single' || q.type === 'multiple' || q.type === 'open')
            ? q.type
            : 'single';
          const base = this.fb.group({
            type: this.fb.control<'single' | 'multiple' | 'open'>(type, { nonNullable: true }),
            text: this.fb.control<string>(q.text || '', { validators: [Validators.required] })
          });

          if (type === 'open') {
            this.questions.push(base);
          } else {
            const optionsArr = this.fb.array((q.options || []).map((o: any) => this.option(o.text || '')));
            const correctIndexList = (q.options || [])
              .map((o: any, idx: number) => (o.isCorrect ? idx : -1))
              .filter((i: number) => i !== -1);
            const correctCtrl = type === 'single'
              ? this.fb.control<number | null>(correctIndexList[0] ?? null)
              : this.fb.control<number[]>(correctIndexList);
            const group = this.fb.group({
              ...base.controls,
              options: optionsArr,
              correct: correctCtrl
            });
            this.questions.push(group);
          }
        }
      } else {
        // fallback: provide an initial question to guide user
        if (this.questions.length === 0) this.addQuestion('single');
      }

      this.loaded.set(true);
      // Finish init phase to allow auto-save on subsequent user edits
      this.initializing = false;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetQuestions() {
    while (this.questions.length > 0) this.questions.removeAt(0);
  }

  // server now returns lowercase types directly ('single' | 'multiple')

  get tutorialUrl(): string {
    return `/studio/tutorials/${this.data().tutorialId}/content`;
  }
}
