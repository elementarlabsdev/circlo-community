import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(m => m.ListComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/edit.component').then(c => c.EditComponent)
  },
  {
    path: ':id/view',
    loadComponent: () => import('./view/view.component').then(c => c.ViewComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommentsRoutingModule { }
