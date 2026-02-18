import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListActivityComponent } from './activity/list-activity/list-activity.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { CreateActivityComponent } from './activity/create-activity/create-activity.component';
import { ViewActivityComponent } from './activity/view-activity/view-activity.component';
import { EditActivityComponent } from './activity/edit-activity/edit-activity.component';
import { SearchActivitiesComponent } from './search-activities/search-activities.component';
import { CreateActivityDropComponent } from './create-activity-drop/create-activity-drop.component';
import { ListActivityDropsComponent } from './list-activity-drops/list-activity-drops.component';
import { PayoutSettingsComponent } from './payouts/payout-settings/payout-settings.component';
import { PayoutHistoryComponent } from './payouts/payout-history/payout-history.component';
import { PartnerProfileComponent } from './partner-profile/partner-profile.component';
import { ViewPartnerProfileComponent } from './view-partner-profile/view-partner-profile.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'list-activities',
      component: ListActivityComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'create-activity',
      component: CreateActivityComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'view-activity',
      component: ViewActivityComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'edit-activity',
      component: EditActivityComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'search-activities',
      component: SearchActivitiesComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'create-activity-drop',
      component: CreateActivityDropComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'list-activity-drops',
      component: ListActivityDropsComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'payout-settings',
      component: PayoutSettingsComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'partner-profile',
      component: PartnerProfileComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'view-partner-profile',
      component: ViewPartnerProfileComponent,
      canActivate: [AuthGuard]
    },
    {
      path: 'payout-history',
      component: PayoutHistoryComponent,
      canActivate: [AuthGuard]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartnerRoutingModule { }
