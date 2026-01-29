import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListQuestComponent } from './list-quest/list-quest.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PermissionGuard } from '../../guards/permission/permission.guard';
import { CreateQuestComponent } from './create-quest/create-quest.component';
import { EditQuestComponent } from './edit-quest/edit-quest.component';
import { ListQuestGroupComponent } from './list-quest-group/list-quest-group.component';
import { CreateQuestGroupComponent } from './create-quest-group/create-quest-group.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-quest',
      component: ListQuestComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Quest' }
    },
    {
      path: 'create-quest',
      component: CreateQuestComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Quest' }
    },
    {
      path: 'edit-quest',
      component: EditQuestComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Quest' }
    },
    {
      path: 'list-quest-group',
      component: ListQuestGroupComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Quest' }
    },
    {
      path: 'create-quest-group',
      component: CreateQuestGroupComponent,
      canActivate: [AuthGuard, PermissionGuard],
      data: { permission: 'Quest' }
    },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestsRoutingModule { }
