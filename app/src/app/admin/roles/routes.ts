import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./list/list').then(c => c.List)
  },
  {
    path: 'new',
    loadComponent: () => import('./new/new').then(c => c.New)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/edit').then(c => c.Edit)
  }
];
