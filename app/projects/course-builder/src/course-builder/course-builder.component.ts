import { Component, input } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Skeleton, } from '@ngstarter/components/skeleton';
import { InlineTextEdit } from '@ngstarter/components/inline-text-edit';
import { RouterLink } from '@angular/router';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'ngs-course-builder',
  imports: [
    Button,
    Skeleton,

    InlineTextEdit,
    Icon,
    Button,
    RouterLink,
  ],
  templateUrl: './course-builder.component.html',
  styleUrl: './course-builder.component.scss'
})
export class CourseBuilderComponent {
  readonly course = input.required<any>();

  private _id(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  newModule() {
    this.course().modules.push({ loading: true });
    const index = this.course().modules.length - 1;
    const newModule = {
      id: this._id(),
      name: 'New Module',
      items: [] as any[]
    };
    this.course().modules[index] = newModule;
  }

  addLesson(module: any) {
    module.items.push({ loading: true });
    const index = module.items.length - 1;
    const newLessonItem = {
      type: 'lesson',
      lesson: {
        id: this._id(),
        name: 'New Lesson'
      }
    };
    module.items[index] = newLessonItem;
  }

  addQuiz(module: any) {
    // Example of adding a mock quiz item (not used in current UI beyond label)
    module.items.push({ loading: true });
    const index = module.items.length - 1;
    module.items[index] = {
      type: 'quiz',
      quiz: {
        id: this._id(),
        name: 'New Quiz'
      }
    };
  }

  onModuleNameChanged(name: string, moduleId: string) {
    // Simulate save and update local state
    setTimeout(() => {
      const m = this.course().modules.find((mm: any) => mm.id === moduleId);
      if (m) m.name = name;
    }, 300);
  }

  onLessonNameChanged(name: string, lessonId: string) {
    // Simulate save and update local state
    setTimeout(() => {
      this.course().modules.forEach((m: any) => {
        m.items.forEach((it: any) => {
          if (it.type === 'lesson' && it.lesson?.id === lessonId) {
            it.lesson.name = name;
          }
        });
      });
    }, 300);
  }

  onQuizNameChanged(name: string, quizId: string) {
    // Simulate save and update local state
    setTimeout(() => {
      this.course().modules.forEach((m: any) => {
        m.items.forEach((it: any) => {
          if (it.type === 'quizId' && it.quizId?.id === quizId) {
            it.quizId.name = name;
          }
        });
      });
    }, 300);
  }

  lessonUrl(lesson: any) {
    return `/applications/courses/course/1/content/lesson/${lesson.id}`;
  }

  quizUrl(quiz: any) {
    return `/applications/courses/course/1/content/quiz/${quiz.id}`;
  }
}
