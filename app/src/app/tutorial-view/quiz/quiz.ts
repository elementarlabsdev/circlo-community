import { Component, computed, inject, signal } from '@angular/core';
import { ProgressBar } from '@ngstarter/components/progress-bar';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Checkbox } from '@ngstarter/components/checkbox';
import { RadioButton, RadioGroup } from '@ngstarter/components/radio';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { TutorialInterface } from '@model/interfaces';
//

@Component({
  selector: 'app-quiz',
  imports: [
    ProgressBar,
    Button,
    Icon,
    Checkbox,
    RadioGroup,
    RadioButton,
    NgClass,
    RouterLink
  ],
  templateUrl: './quiz.html',
  styleUrl: './quiz.scss',
})
export class Quiz {
  private api = inject(ApiService);
  private activatedRoute = inject(ActivatedRoute);
  private routeOutletData = inject<any>(ROUTER_OUTLET_DATA);

  loaded = signal(false);
  quiz = signal<any>(null);
  tutorial = signal<TutorialInterface | null>(null);
  previousItem = signal<any>(null);
  nextItem = signal<any>(null);
  currentIndex = signal(0);
  // whether current question has been checked
  checked = signal(false);
  // whether the current answer is fully correct (for message)
  isAnswerCorrect = signal<boolean | null>(null);
  // whether quiz is finished (show summary)
  finished = signal(false);

  // Server validation markers
  private correctOptionIds = signal<Set<string>>(new Set());
  private incorrectSelectedOptionIds = signal<Set<string>>(new Set());

  private quizSlug!: string;

  // answers: index -> number | number[]
  private answersMap = new Map<number, number | number[]>();
  // results: index -> correct?
  private resultsMap = new Map<number, boolean>();

  get tutorialSlug() {
    return this.routeOutletData().tutorialSlug;
  }

  readonly total = computed(() => this.quiz()?.questions?.length || 0);
  readonly progress = computed(() => this.total() === 0 ? 0 : ((this.currentIndex() + 1) / this.total()) * 100);
  readonly question = computed(() => {
    const q = this.quiz()?.questions?.[this.currentIndex()] ?? null;
    return q;
  });

  readonly correctCount = computed(() => {
    let n = 0;
    for (const v of this.resultsMap.values()) if (v) n++;
    return n;
  });

  readonly incorrectCount = computed(() => Math.max(0, this.total() - this.correctCount()));

  // Rounded percent of correct answers for summary
  readonly scorePercent = computed(() => {
    const total = this.total();
    if (!total) return 0;
    return Math.round((this.correctCount() / total) * 100);
  });

  ngOnInit() {
    const quizSlug = this.activatedRoute.snapshot.params['quizSlug'];
    this.quizSlug = quizSlug;
    this.api
      .get(`tutorials/${this.tutorialSlug}/quizzes/${quizSlug}`)
      .subscribe((res: any) => {
        this.quiz.set(res.quiz);
        this.tutorial.set(res.tutorial);
        this.previousItem.set(res.previousItem);
        this.nextItem.set(res.nextItem);
        this.loaded.set(true);
      });
  }

  // Selection helpers
  isChecked(optionIndex: number): boolean {
    const q = this.question();
    if (!q) return false;
    const ans = this.answersMap.get(this.currentIndex());
    if (q.type === 'multiple') {
      return Array.isArray(ans) ? ans.includes(optionIndex) : false;
    }
    return typeof ans === 'number' ? ans === optionIndex : false;
  }

  toggleMultiple(optionIndex: number) {
    const q = this.question();
    if (!q) return;
    if (this.checked()) return; // lock after check
    const current = this.answersMap.get(this.currentIndex());
    const set = new Set<number>(Array.isArray(current) ? current : []);
    if (set.has(optionIndex)) set.delete(optionIndex); else set.add(optionIndex);
    this.answersMap.set(this.currentIndex(), Array.from(set));
  }

  selectSingle(optionIndex: number) {
    if (this.checked()) return; // lock after check
    this.answersMap.set(this.currentIndex(), optionIndex);
  }

  // For binding radio group value
  selectedSingleIndex(): number {
    const ans = this.answersMap.get(this.currentIndex());
    return typeof ans === 'number' ? ans : -1;
  }

  canGoNext(): boolean {
    // Next is available only after check
    return this.checked();
  }

  prev() {
    if (this.currentIndex() > 0) {
      this.currentIndex.set(this.currentIndex() - 1);
      this.resetCheckState();
    }
  }

  next() {
    if (this.currentIndex() < this.total() - 1) {
      this.currentIndex.set(this.currentIndex() + 1);
      this.resetCheckState();
    } else {
      // Finished the last question – show summary
      this.finished.set(true);
    }
  }

  // Whether user made a selection to allow checking
  canCheck(): boolean {
    const q = this.question();
    if (!q) return false;
    const ans = this.answersMap.get(this.currentIndex());
    if (q.type === 'multiple') return Array.isArray(ans) && ans.length > 0;
    if (q.type === 'single') return typeof ans === 'number' && ans >= 0;
    return false;
  }

  // Trigger answer validation
  check() {
    if (!this.canCheck()) return;
    const q = this.question();
    if (!q) return;
    // Build selected option ids from selected indices
    const ans = this.answersMap.get(this.currentIndex());
    let selectedOptionIds: string[] = [];
    if (q.type === 'single' && typeof ans === 'number') {
      const opt = q.options?.[ans];
      if (opt?.id) selectedOptionIds = [opt.id];
    } else if (q.type === 'multiple' && Array.isArray(ans)) {
      selectedOptionIds = (ans as number[])
        .map((i) => q.options?.[i]?.id)
        .filter((v: any) => !!v);
    }

    this.api
      .post(`tutorials/${this.tutorialSlug}/quizzes/${this.quizSlug}/check`, {
        questionId: q.id,
        selectedOptionIds,
      })
      .subscribe((res: any) => {
        const correctIds = new Set<string>(res?.correctOptionIds ?? []);
        const wrongSelected = new Set<string>(
          res?.incorrectSelectedOptionIds ?? [],
        );
        this.correctOptionIds.set(correctIds);
        this.incorrectSelectedOptionIds.set(wrongSelected);
        const isCorrect = !!res?.correct;
        this.isAnswerCorrect.set(isCorrect);
        this.resultsMap.set(this.currentIndex(), isCorrect);
        this.checked.set(true);
      });
  }

  // Helpers for styling options after check
  isOptionCorrect(optionIndex: number): boolean {
    const q = this.question();
    if (!q) return false;
    const opt = q.options?.[optionIndex];
    if (!opt?.id) return false;
    return this.correctOptionIds().has(opt.id);
  }

  isOptionIncorrectSelected(optionIndex: number): boolean {
    if (!this.checked()) return false;
    const q = this.question();
    if (!q) return false;
    const opt = q.options?.[optionIndex];
    if (!opt?.id) return false;
    if (this.correctOptionIds().has(opt.id)) return false;
    return this.incorrectSelectedOptionIds().has(opt.id);
  }

  private resetCheckState() {
    this.checked.set(false);
    this.isAnswerCorrect.set(null);
    this.correctOptionIds.set(new Set());
    this.incorrectSelectedOptionIds.set(new Set());
  }

  retry() {
    this.currentIndex.set(0);
    this.answersMap.clear();
    this.resultsMap.clear();
    this.finished.set(false);
    this.resetCheckState();
  }
}
