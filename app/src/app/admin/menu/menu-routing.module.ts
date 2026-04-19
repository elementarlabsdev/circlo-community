import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(c => c.ListComponent),
    title: 'title.admin.menu.list'
  },
  {
    path: 'new',
    loadComponent: () => import('./edit/edit.component').then(c => c.EditComponent),
    title: 'title.admin.menu.new'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/edit.component').then(c => c.EditComponent),
    title: 'title.admin.menu.edit'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuRoutingModule { }
