import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListBookingsComponent } from './list-bookings/list-bookings.component';
import { AuthGuard } from '../../guards/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list-bookings',
        component: ListBookingsComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule { }
