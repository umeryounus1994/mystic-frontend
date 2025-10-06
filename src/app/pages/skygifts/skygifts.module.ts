import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkygiftsRoutingModule } from './skygifts-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateSkygiftsComponent } from './create-skygifts/create-skygifts.component';
import { ListSkygiftsComponent } from './list-skygifts/list-skygifts.component';
import { EditSkygiftsComponent } from './edit-skygifts/edit-skygifts.component';


@NgModule({
  declarations: [CreateSkygiftsComponent, ListSkygiftsComponent, EditSkygiftsComponent],
  imports: [
    CommonModule,
    SkygiftsRoutingModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SkygiftsModule { }
