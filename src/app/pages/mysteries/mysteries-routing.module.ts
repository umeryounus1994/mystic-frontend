import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { ListMysteriesComponent } from './list-mysteries/list-mysteries.component';
import { AddMysteriesComponent } from './add-mysteries/add-mysteries.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-mystery',
      component: ListMysteriesComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'add-mystery',
      component: AddMysteriesComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MysteriesRoutingModule { }
