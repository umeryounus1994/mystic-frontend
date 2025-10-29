import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListActivityComponent } from './activity/list-activity/list-activity.component';
import { AuthGuard } from '../../guards/auth/auth.guard';
import { CreateActivityComponent } from './activity/create-activity/create-activity.component';
import { ViewActivityComponent } from './activity/view-activity/view-activity.component';
import { EditActivityComponent } from './activity/edit-activity/edit-activity.component';
import { SearchActivitiesComponent } from './search-activities/search-activities.component';

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
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PartnerRoutingModule { }
