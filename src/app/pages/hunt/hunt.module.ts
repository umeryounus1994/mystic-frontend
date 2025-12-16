import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HuntRoutingModule } from './hunt-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateHuntComponent } from './create-hunt/create-hunt.component';
import { ListHuntComponent } from './list-hunt/list-hunt.component';
import { EditHuntComponent } from './edit-hunt/edit-hunt.component';
import { QRCodeModule } from 'angularx-qrcode';


@NgModule({
  declarations: [CreateHuntComponent, ListHuntComponent, EditHuntComponent],
  imports: [
    CommonModule,
    HuntRoutingModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
    TranslateModule
  ]
})
export class HuntModule { }
