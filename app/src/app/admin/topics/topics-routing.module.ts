import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./list/list.component').then(m => m.ListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./new/new.component').then(m => m.NewComponent),
    title: 'title.admin.topics.new'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent),
    title: 'title.admin.topics.edit'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicsRoutingModule { }
