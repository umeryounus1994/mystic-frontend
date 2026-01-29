import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUserComponent } from './list-user/list-user.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PermissionGuard } from '../../guards/permission/permission.guard';
import { ProfileComponent } from './profile/profile.component';
import { MythicasComponent } from './mythicas/mythicas.component';
import { AddDropComponent } from './add-drop/add-drop.component';
import { ListDropComponent } from './list-drop/list-drop.component';
import { RewardsComponent } from './rewards/rewards.component';
import { ListPayoutsComponent } from './payouts/list-payouts/list-payouts.component';
import { CommissionRateComponent } from './commission-rate/commission-rate.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-user',
      component: ListUserComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Users' }
    },
    {
      path: 'profile',
      component: ProfileComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'mythicas',
      component: MythicasComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Mythicas' }
    },
    {
      path: 'add-drop',
      component: AddDropComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Drops' }
    },
    {
      path: 'list-drop',
      component: ListDropComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Drops' }
    },
    {
      path: 'list-rewards',
      component: RewardsComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Drops' }
    },
    {
      path: 'list-payouts',
      component: ListPayoutsComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Payouts Management' }
    },
    {
      path: 'commission-rate',
      component: CommissionRateComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Commission Rate' }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
