import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MissionsRoutingModule } from './missions-routing.module';
import { CreateMissionsComponent } from './create-missions/create-missions.component';
import { ListMissionsComponent } from './list-missions/list-missions.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EditMissionComponent } from './edit-mission/edit-mission.component';


@NgModule({
  declarations: [CreateMissionsComponent, ListMissionsComponent, EditMissionComponent],
  imports: [
    CommonModule,
    MissionsRoutingModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class MissionsModule { }
