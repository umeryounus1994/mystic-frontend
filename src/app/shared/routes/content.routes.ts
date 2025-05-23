import { Routes } from '@angular/router';

export const content: Routes = [
  { path: '', redirectTo: 'dashboard/admin', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import("../../pages/dashboard/dashboard.module").then(module => module.DashboardModule)
  },
  {
    path: 'quest',
    loadChildren: () => import("../../pages/quests/quests.module").then(module => module.QuestsModule)
  },
  {
    path: 'mission',
    loadChildren: () => import("../../pages/missions/missions.module").then(module => module.MissionsModule)
  },
  {
    path: 'hunt',
    loadChildren: () => import("../../pages/hunt/hunt.module").then(module => module.HuntModule)
  },
  {
    path: 'mystery',
    loadChildren: () => import("../../pages/mysteries/mysteries.module").then(module => module.MysteriesModule)
  },
  {
    path: 'management',
    loadChildren: () => import("../../pages/management/management.module").then(module => module.ManagementModule)
  }
];
