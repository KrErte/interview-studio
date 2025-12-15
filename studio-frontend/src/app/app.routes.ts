import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard, loginRedirectGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'interview-studio' },
  {
    path: 'login',
    canActivate: [loginRedirectGuard],
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'interview-studio',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/mvp/interview-studio-page.component').then(m => m.InterviewStudioPageComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/candidate-dashboard.component').then(m => m.CandidateDashboardComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'upload-cv'
      },
      {
        path: 'upload-cv',
        loadComponent: () =>
          import('./pages/dashboard/tabs/upload-cv-tab.component').then(m => m.UploadCvTabComponent)
      },
      {
        path: 'match',
        loadComponent: () =>
          import('./pages/dashboard/tabs/match-tab.component').then(m => m.MatchTabComponent)
      },
      {
        path: 'job-analysis',
        loadComponent: () =>
          import('./pages/dashboard/tabs/job-analysis-tab.component').then(m => m.JobAnalysisTabComponent)
      }
    ]
  },
  {
    path: 'pivot-roles',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/candidate/pivot-roles/pivot-roles.page').then(m => m.PivotRolesPageComponent)
  },
  {
    path: 'candidate-discovery',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/interviewer/candidate-discovery/candidate-discovery.page').then(
        m => m.CandidateDiscoveryPageComponent
      )
  },
  {
    path: 'interview-deja-vu',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/mvp/interview-deja-vu-page.component').then(m => m.InterviewDejaVuPageComponent)
  },
  {
    path: 'training',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/training/training.component').then(m => m.TrainingComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  { path: '**', redirectTo: 'interview-studio' },
];

export default provideRouter(appRoutes);
