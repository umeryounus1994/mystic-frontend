import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestsRoutingModule } from './quests-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateQuestComponent } from './create-quest/create-quest.component';
import { QRCodeModule } from 'angularx-qrcode';
import { ListQuestComponent } from './list-quest/list-quest.component';
import { EditQuestComponent } from './edit-quest/edit-quest.component';


@NgModule({
  declarations: [CreateQuestComponent, ListQuestComponent, EditQuestComponent],
  imports: [
    CommonModule,
    QuestsRoutingModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule
  ]
})
export class QuestsModule { }
