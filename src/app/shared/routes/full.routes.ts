import { Routes } from '@angular/router';

export const full: Routes = [
  {
    path: 'auth',
    loadChildren: () => import("../../pages/auth/auth.module").then(module => module.AuthModule)
  },
  {
    path: 'verify-email',
    loadComponent: () => import("../../pages/auth/verify-email/verify-email.component").then(m => m.VerifyEmailComponent)
  }
];
