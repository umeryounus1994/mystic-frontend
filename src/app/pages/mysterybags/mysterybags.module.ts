import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MysterybagsRoutingModule } from './mysterybags-routing.module';
import { CreateMysterybagComponent } from './create-mysterybag/create-mysterybag.component';
import { EditMysterybagComponent } from './edit-mysterybag/edit-mysterybag.component';
import { ListMysterybagsComponent } from './list-mysterybags/list-mysterybags.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [CreateMysterybagComponent, EditMysterybagComponent, ListMysterybagsComponent],
  imports: [
    CommonModule,
    MysterybagsRoutingModule,
        NgxSpinnerModule,
        DataTablesModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule
  ]
})
export class MysterybagsModule { }
