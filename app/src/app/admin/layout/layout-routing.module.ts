import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(m => m.ListComponent),
    title: 'title.admin.layout'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent),
    title: 'title.admin.layout.edit'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
