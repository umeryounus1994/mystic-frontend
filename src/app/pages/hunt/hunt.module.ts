import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HuntRoutingModule } from './hunt-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateHuntComponent } from './create-hunt/create-hunt.component';
import { ListHuntComponent } from './list-hunt/list-hunt.component';


@NgModule({
  declarations: [CreateHuntComponent, ListHuntComponent],
  imports: [
    CommonModule,
    HuntRoutingModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class HuntModule { }
