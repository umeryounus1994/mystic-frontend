import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListSkygiftsComponent } from './list-skygifts/list-skygifts.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { CreateSkygiftsComponent } from './create-skygifts/create-skygifts.component';
import { EditSkygiftsComponent } from './edit-skygifts/edit-skygifts.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-skygifts',
      component: ListSkygiftsComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'add-skygifts',
      component: CreateSkygiftsComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'edit-skygifts',
      component: EditSkygiftsComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SkygiftsRoutingModule { }
