import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagementRoutingModule } from './management-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListUserComponent } from './list-user/list-user.component';
import { ProfileComponent } from './profile/profile.component';
import { MythicasComponent } from './mythicas/mythicas.component';


@NgModule({
  declarations: [ListUserComponent, ProfileComponent, MythicasComponent],
  imports: [
    CommonModule,
    ManagementRoutingModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ManagementModule { }
