import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PermissionGuard } from '../../guards/permission/permission.guard';
import { ListMissionsComponent } from './list-missions/list-missions.component';
import { CreateMissionsComponent } from './create-missions/create-missions.component';
import { EditMissionComponent } from './edit-mission/edit-mission.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-mission',
      component: ListMissionsComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Missions' }
    },
    {
      path: 'create-mission',
      component: CreateMissionsComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Missions' }
    },
    {
      path: 'edit-mission',
      component: EditMissionComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Missions' }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MissionsRoutingModule { }
