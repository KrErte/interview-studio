import { Routes } from '@angular/router';
import { PublicShellComponent } from './layout/public-shell.component';
import { AppShellComponent } from './layout/app-shell.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './core/auth/auth.guard';
import { PivotRolesPageComponent } from './pages/candidate/pivot-roles/pivot-roles.page';
import { FutureproofRoadmapPageComponent } from './pages/candidate/pivot-roles/futureproof-roadmap.page';

export const routes: Routes = [
  {
    path: '',
    component: PublicShellComponent,
    children: [
      { path: '', pathMatch: 'full', component: LandingComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'futureproof',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'overview' },
          { path: 'overview', component: PivotRolesPageComponent },
          {
            path: 'questions',
            loadComponent: () =>
              import('./pages/candidate/pivot-roles/futureproof-questions.page').then(
                (m) => m.FutureproofQuestionsPageComponent
              )
          },
          {
            path: 'assessment',
            loadComponent: () =>
              import('./pages/candidate/pivot-roles/futureproof-assessment.page').then(
                (m) => m.FutureproofAssessmentPageComponent
              )
          },
          { path: 'roadmap', component: FutureproofRoadmapPageComponent }
        ]
      },
      { path: '**', component: NotFoundComponent }
    ]
  }
];
