import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BookingRoutingModule } from './booking-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ListBookingsComponent } from './list-bookings/list-bookings.component';
import { DataTablesModule } from 'angular-datatables';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [ListBookingsComponent],
  imports: [
    CommonModule,
    BookingRoutingModule,
    SharedModule,
    FormsModule,
    DataTablesModule,
    NgxSpinnerModule,
    TranslateModule
  ]
})
export class BookingModule { }
