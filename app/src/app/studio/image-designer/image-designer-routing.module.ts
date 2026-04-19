import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./list/list').then(c => c.List),
  },
  {
    path: ':id/edit',
    loadChildren: () => import('./edit/image-designer-edit.module').then(m => m.ImageDesignerEditModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageDesignerRoutingModule { }
