import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MysteriesRoutingModule } from './mysteries-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AddMysteriesComponent } from './add-mysteries/add-mysteries.component';
import { ListMysteriesComponent } from './list-mysteries/list-mysteries.component';
import { EditMysteriesComponent } from './edit-mysteries/edit-mysteries.component';

@NgModule({
  declarations: [AddMysteriesComponent,ListMysteriesComponent,EditMysteriesComponent],
  imports: [
    CommonModule,
    MysteriesRoutingModule,
    MysteriesRoutingModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ]
})
export class MysteriesModule { }
