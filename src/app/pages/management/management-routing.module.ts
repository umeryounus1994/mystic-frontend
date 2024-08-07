import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListUserComponent } from './list-user/list-user.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { ProfileComponent } from './profile/profile.component';
import { MythicasComponent } from './mythicas/mythicas.component';
import { AddDropComponent } from './add-drop/add-drop.component';
import { ListDropComponent } from './list-drop/list-drop.component';
import { RewardsComponent } from './rewards/rewards.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-user',
      component: ListUserComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'profile',
      component: ProfileComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'mythicas',
      component: MythicasComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'add-drop',
      component: AddDropComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'list-drop',
      component: ListDropComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'list-rewards',
      component: RewardsComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
