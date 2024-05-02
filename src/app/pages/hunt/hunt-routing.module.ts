import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListHuntComponent } from './list-hunt/list-hunt.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { CreateHuntComponent } from './create-hunt/create-hunt.component';
const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-hunt',
      component: ListHuntComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'create-hunt',
      component: CreateHuntComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HuntRoutingModule { }
