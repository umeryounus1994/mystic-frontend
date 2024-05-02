import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SkillsRoutingModule } from './skills-routing.module';
import { AddSkillComponent } from './add-skill/add-skill.component';
import { ListSkillComponent } from './list-skill/list-skill.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [AddSkillComponent,ListSkillComponent],
  imports: [
    CommonModule,
    SkillsRoutingModule,
    NgxSpinnerModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class SkillsModule { }
