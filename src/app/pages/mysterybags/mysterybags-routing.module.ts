import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListMysterybagsComponent } from './list-mysterybags/list-mysterybags.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { CreateMysterybagComponent } from './create-mysterybag/create-mysterybag.component';
import { EditMysterybagComponent } from './edit-mysterybag/edit-mysterybag.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-mysterybag',
      component: ListMysterybagsComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'add-mysterybag',
      component: CreateMysterybagComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'edit-mysterybag',
      component: EditMysterybagComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MysterybagsRoutingModule { }
