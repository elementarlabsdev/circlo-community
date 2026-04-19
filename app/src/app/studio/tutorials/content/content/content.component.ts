import { Component, inject, signal, Signal } from '@angular/core';
import {  Button } from '@ngstarter/components/button';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { Skeleton, } from '@ngstarter/components/skeleton';
import { ApiService } from '@services/api.service';
import { ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { Icon } from '@ngstarter/components/icon';
import { InlineTextEdit } from '@ngstarter/components/inline-text-edit';
import { TUTORIAL_EDIT_ROOT } from '@/studio/tutorials/types';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  imports: [
    Button,
    Icon,
    Button,
    Menu,
    MenuItem,
    Skeleton,

    MenuTrigger,
    RouterLink,

    InlineTextEdit,
    ScrollbarArea,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
    DragDropModule
  ],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {
  private api = inject(ApiService);
  private editRoot = inject(TUTORIAL_EDIT_ROOT);

  readonly data = inject(ROUTER_OUTLET_DATA) as Signal<{tutorialId: string}>;
  readonly loaded = signal(false);
  readonly tutorial = signal<any>(null);
  savingSectionsOrder = false;

  ngOnInit() {
    this.api
      .get(`studio/tutorials/${this.data().tutorialId}/details`)
      .subscribe((res: any) => {
        this.tutorial.set(res.tutorial);
        this.loaded.set(true);
      });
  }

  newSection() {
    this.tutorial().sections.push({
      loading: true,
    });
    const index = this.tutorial().sections.length - 1;
    this.api
      .post(`studio/tutorials/${this.data().tutorialId}/sections`)
      .subscribe((res: any) => {
        this.tutorial().sections[index] = res.section;
      });
  }

  addLesson(section: any) {
    section.items.push({
      loading: true,
    });
    const index = section.items.length - 1;
    this.api
      .post(`studio/tutorials/${section.id}/lessons`)
      .subscribe((res: any) => {
        section.items[index] = res.item;
      });
  }

  addQuiz(section: any) {
    section.items.push({
      loading: true,
    });
    const index = section.items.length - 1;
    this.api
      .post(`studio/tutorials/${section.id}/quizzes`)
      .subscribe((res: any) => {
        section.items[index] = res.item;
      });
  }

  onSectionNameChanged(name: string, sectionId: string) {
    this.api
      .post(`studio/tutorials/sections/${sectionId}/name`, {name})
      .subscribe((res: any) => {
      });
  }

  onLessonNameChanged(name: string, lessonId: string) {
    this.api
      .post(`studio/tutorials/lessons/${lessonId}/name`, {name})
      .subscribe((res: any) => {
      });
  }

  lessonUrl(lesson: any) {
    return `/studio/tutorials/${this.tutorial().id}/content/lesson/${lesson.id}`;
  }

  onQuizNameChanged(name: string, quizzId: string) {
    this.api
      .post(`studio/tutorials/quizzes/${quizzId}/name`, { name })
      .subscribe((res: any) => {
      });
  }

  quizUrl(quiz: any) {
    return `/studio/tutorials/${this.tutorial().id}/content/quiz/${quiz.id}`;
  }

  dropItem(event: CdkDragDrop<any[]>, section: any) {
    const items = section.items;
    // Optimistically reorder in UI
    moveItemInArray(items, event.previousIndex, event.currentIndex);

    // Build payload with new positions
    const payload = {
      items: items.map((it: any, idx: number) => ({ id: it.id, position: idx }))
    };

    this.api.post(`studio/tutorials/${section.id}/items/reorder`, payload).subscribe({
      error: () => {
        // Rollback if failed: reverse move
        moveItemInArray(items, event.currentIndex, event.previousIndex);
      }
    });
  }

  moveSection(index: number, delta: number) {
    const sections = this.tutorial().sections;
    const target = index + delta;
    if (target < 0 || target >= sections.length || this.savingSectionsOrder) return;

    // Optimistic swap
    const snapshot = sections.slice();
    [sections[index], sections[target]] = [sections[target], sections[index]];
    this.savingSectionsOrder = true;

    const payload = {
      items: sections.map((s: any, i: number) => ({ id: s.id, position: i }))
    };

    this.api.post(`studio/tutorials/${this.tutorial().id}/sections/reorder`, payload).subscribe({
      next: () => {
        this.savingSectionsOrder = false;
      },
      error: () => {
        // rollback
        for (let i = 0; i < snapshot.length; i++) sections[i] = snapshot[i];
        this.savingSectionsOrder = false;
      }
    });
  }
}
