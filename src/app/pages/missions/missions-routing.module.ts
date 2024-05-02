import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { ListMissionsComponent } from './list-missions/list-missions.component';
import { CreateMissionsComponent } from './create-missions/create-missions.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-mission',
      component: ListMissionsComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'create-mission',
      component: CreateMissionsComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MissionsRoutingModule { }
