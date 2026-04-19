import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list.component').then(c => c.ListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./new/new.component').then(c => c.NewComponent),
    title: 'title.admin.channels.new'
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit/edit.component').then(m => m.EditComponent),
    title: 'title.admin.channels.edit'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChannelsRoutingModule { }
