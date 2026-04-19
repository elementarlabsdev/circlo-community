import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: ':tutorialSlug',
    pathMatch: 'full',
    redirectTo: ':tutorialSlug/overview',
  },
  {
    path: ':tutorialSlug/overview',
    loadComponent: () => import('./overview/overview').then(c => c.Overview),
  },
  {
    path: ':tutorialSlug',
    loadComponent: () => import('./common/common').then(c => c.Common),
    children: [
      {
        path: 'lesson/:lessonSlug',
        loadComponent: () => import('./lesson/lesson').then(c => c.Lesson),
      },
      {
        path: 'quiz/:quizSlug',
        loadComponent: () => import('./quiz/quiz').then(c => c.Quiz),
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TutorialViewRoutingModule {
}
