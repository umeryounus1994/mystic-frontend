import { Routes, RouterModule } from '@angular/router';

export const full: Routes = [
  {
    path: 'auth',
    loadChildren: () => import("../../pages/auth/auth.module").then(module => module.AuthModule)
  },
];
