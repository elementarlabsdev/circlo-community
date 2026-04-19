import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(c => c.ListComponent),
    pathMatch: 'full',
    title: 'title.admin.users.list',
  },
  {
    path: 'new',
    loadComponent: () => import('./new/new.component').then(c => c.NewComponent),
    title: 'title.admin.users.new',
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/edit.component').then(c => c.EditComponent),
    title: 'title.admin.users.edit',
  },
  {
    path: ':id/view',
    loadComponent: () => import('./view/view.component').then(c => c.ViewComponent),
    title: 'title.admin.users.view',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {
}
