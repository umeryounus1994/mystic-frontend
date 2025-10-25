import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminComponent } from './admin/admin.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PartnerDashboardComponent } from './partner-dashboard/partner-dashboard.component';


@NgModule({
  declarations: [AdminComponent,PartnerDashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NgxSpinnerModule
  ]
})
export class DashboardModule { }
