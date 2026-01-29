import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListHuntComponent } from './list-hunt/list-hunt.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PermissionGuard } from '../../guards/permission/permission.guard';
import { CreateHuntComponent } from './create-hunt/create-hunt.component';
import { EditHuntComponent } from './edit-hunt/edit-hunt.component';
const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-hunt',
      component: ListHuntComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Hunts' }
    },
    {
      path: 'create-hunt',
      component: CreateHuntComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Hunts' }
    },
    {
      path: 'edit-hunt',
      component: EditHuntComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Hunts' }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HuntRoutingModule { }
