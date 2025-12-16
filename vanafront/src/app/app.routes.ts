import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'risk',
    loadComponent: () =>
      import('./pages/risk/risk.component').then(m => m.RiskStubComponent)
  },
  { path: '**', redirectTo: '' }
];
