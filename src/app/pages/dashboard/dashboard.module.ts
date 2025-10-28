import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminComponent } from './admin/admin.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PartnerDashboardComponent } from './partner-dashboard/partner-dashboard.component';
import { FamilyDashboardComponent } from './family-dashboard/family-dashboard.component';


@NgModule({
  declarations: [AdminComponent,PartnerDashboardComponent, FamilyDashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NgxSpinnerModule
  ]
})
export class DashboardModule { }
