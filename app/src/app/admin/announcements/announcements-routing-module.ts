import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./list/list').then(m => m.List)
  },
  {
    path: 'new',
    loadComponent: () => import('./new/new').then(m => m.New)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/edit').then(m => m.Edit)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnnouncementsRoutingModule { }
