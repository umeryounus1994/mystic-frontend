import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './menu/sidebar/sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { AppDatePipe } from './pipes/app-date.pipe';

@NgModule({
  declarations: [HeaderComponent, SidebarComponent, AppDatePipe],
  imports: [CommonModule, RouterModule, TranslateModule],
  exports: [HeaderComponent, SidebarComponent, TranslateModule, AppDatePipe]
})
export class SharedModule { }
