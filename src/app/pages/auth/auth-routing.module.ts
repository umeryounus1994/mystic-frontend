import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ResetUserPasswordComponent } from './reset-user-password/reset-user-password.component';
import { PartnerRegistrationComponent } from './partner-registration/partner-registration.component';
import { FamilyRegistrationComponent } from './family-registration/family-registration.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent
      },
      {
        path: 'reset-user-password',
        component: ResetUserPasswordComponent
      },
      {
        path: 'partner-registration',
        component: PartnerRegistrationComponent,
        data: { animation: 'auth' }
      },
           {
        path: 'family-registration',
        component: FamilyRegistrationComponent,
        data: { animation: 'auth' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
