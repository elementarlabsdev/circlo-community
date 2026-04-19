import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./content/content.component').then(c => c.ContentComponent)
  },
  {
    path: 'lesson/:id',
    loadComponent: () => import('./lesson/lesson.component').then(c => c.LessonComponent)
  },
  {
    path: 'quiz/:id',
    loadComponent: () => import('./quiz/quiz.component').then(c => c.QuizComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule { }
