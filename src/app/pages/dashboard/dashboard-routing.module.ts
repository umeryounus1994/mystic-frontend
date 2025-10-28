import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { PartnerDashboardComponent } from './partner-dashboard/partner-dashboard.component';
import { FamilyDashboardComponent } from './family-dashboard/family-dashboard.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'partner',
        component: PartnerDashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'family',
        component: FamilyDashboardComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
