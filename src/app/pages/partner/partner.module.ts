import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PartnerRoutingModule } from './partner-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateActivityComponent } from './activity/create-activity/create-activity.component';
import { ListActivityComponent } from './activity/list-activity/list-activity.component';
import { ViewActivityComponent } from './activity/view-activity/view-activity.component';
import { EditActivityComponent } from './activity/edit-activity/edit-activity.component';
import { SearchActivitiesComponent } from './search-activities/search-activities.component';
import { CreateActivityDropComponent } from './create-activity-drop/create-activity-drop.component';
import { ListActivityDropsComponent } from './list-activity-drops/list-activity-drops.component';


@NgModule({
  declarations: [CreateActivityComponent, ListActivityComponent, ViewActivityComponent, EditActivityComponent, SearchActivitiesComponent,
    CreateActivityDropComponent, ListActivityDropsComponent
  ],
  imports: [
    CommonModule,
    PartnerRoutingModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class PartnerModule { }
