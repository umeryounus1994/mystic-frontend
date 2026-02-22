import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

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
import { HttpClientModule, HttpClient } from '@angular/common/http';

// Register German locale so formatDate(..., 'de') works (avoids NG0701)
registerLocaleData(localeDe, 'de');
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { PaypalSuccessComponent } from './components/paypal-success/paypal-success.component';
import { PaypalCancelComponent } from './components/paypal-cancel/paypal-cancel.component';

@NgModule({
  declarations: [
    AppComponent,
    ContentComponent,
    FullWidthComponent,
    PaypalSuccessComponent,
    PaypalCancelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      defaultLanguage: 'en'
    }),
    TranslateModule
  ],
  providers: [
    RestApiService, 
    HelperService, 
    AuthService, 
    StorageService,
    WebStorageModule,
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
