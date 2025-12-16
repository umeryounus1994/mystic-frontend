import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './menu/sidebar/sidebar.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [HeaderComponent, SidebarComponent],
  imports: [CommonModule, RouterModule, TranslateModule],
  exports: [HeaderComponent, SidebarComponent, TranslateModule]
})
export class SharedModule { }
