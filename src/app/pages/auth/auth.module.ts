import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ResetUserPasswordComponent } from './reset-user-password/reset-user-password.component';
import { PartnerRegistrationComponent } from './partner-registration/partner-registration.component';
import { FamilyRegistrationComponent } from './family-registration/family-registration.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { TermsComponent } from './terms/terms.component';
import { AuthLanguageSwitcherComponent } from './auth-language-switcher/auth-language-switcher.component';


@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    ResetUserPasswordComponent,
    PartnerRegistrationComponent,
    FamilyRegistrationComponent,
    ConfirmEmailComponent,
    TermsComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    TranslateModule,
    RouterModule,
    AuthLanguageSwitcherComponent
  ]
})
export class AuthModule { }
