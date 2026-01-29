import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListBookingsComponent } from './list-bookings/list-bookings.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PermissionGuard } from '../../guards/permission/permission.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list-bookings',
        component: ListBookingsComponent,
        canActivate: [AuthGuard, PermissionGuard],
        data: { permission: 'Bookings' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule { }
