import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagementRoutingModule } from './management-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ListUserComponent } from './list-user/list-user.component';
import { ProfileComponent } from './profile/profile.component';
import { MythicasComponent } from './mythicas/mythicas.component';
import { AddDropComponent } from './add-drop/add-drop.component';
import { ListDropComponent } from './list-drop/list-drop.component';
import { RewardsComponent } from './rewards/rewards.component';
import { ListPayoutsComponent } from './payouts/list-payouts/list-payouts.component';
import { CommissionRateComponent } from './commission-rate/commission-rate.component';
import { ListExploringSpotComponent } from './list-exploring-spot/list-exploring-spot.component';
import { AddExploringSpotComponent } from './add-exploring-spot/add-exploring-spot.component';
import { EditExploringSpotComponent } from './edit-exploring-spot/edit-exploring-spot.component';


@NgModule({
  declarations: [ListUserComponent, ProfileComponent, MythicasComponent,AddDropComponent,ListDropComponent, RewardsComponent, ListPayoutsComponent, CommissionRateComponent, ListExploringSpotComponent, AddExploringSpotComponent, EditExploringSpotComponent],
  imports: [
    CommonModule,
    ManagementRoutingModule,
    SharedModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule
  ]
})
export class ManagementModule { }
