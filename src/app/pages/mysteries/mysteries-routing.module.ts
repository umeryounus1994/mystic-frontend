import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { ListMysteriesComponent } from './list-mysteries/list-mysteries.component';
import { AddMysteriesComponent } from './add-mysteries/add-mysteries.component';
import { EditMysteriesComponent } from './edit-mysteries/edit-mysteries.component';

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
    },
    {
      path: 'edit-mystery',
      component: EditMysteriesComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MysteriesRoutingModule { }
