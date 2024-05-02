import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUserComponent } from './list-user/list-user.component';
import { AuthGuard } from '../../guards/auth/auth.guard';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-user',
      component: ListUserComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
