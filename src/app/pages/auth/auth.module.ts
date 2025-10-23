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


@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    ResetUserPasswordComponent,
    PartnerRegistrationComponent,
    FamilyRegistrationComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule
  ]
})
export class AuthModule { }
