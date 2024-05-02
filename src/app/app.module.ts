import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './shared/menu/sidebar/sidebar.component';
import { ContentComponent } from './layouts/content/content.component';
import { FullWidthComponent } from './layouts/full-width/full-width.component';
import { RestApiService } from './services/api/rest-api.service';
import { HelperService } from './services/helper/helper.service';
import { AuthService } from './services/auth/auth.service';
import { StorageService } from './services/storage/storage.service';
import { WebStorageModule } from 'ngx-store';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    ContentComponent,
    FullWidthComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    ToastrModule.forRoot()
  ],
  providers: [RestApiService, HelperService, AuthService, StorageService,
    WebStorageModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
