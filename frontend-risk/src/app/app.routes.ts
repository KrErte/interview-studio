import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { RiskComponent } from './pages/risk/risk.component';
import { CandidateDashboardComponent } from './pages/dashboard/candidate-dashboard.component';
import { UploadCvTabComponent } from './pages/dashboard/tabs/upload-cv-tab.component';
import { MatchTabComponent } from './pages/dashboard/tabs/match-tab.component';
import { JobAnalysisTabComponent } from './pages/dashboard/tabs/job-analysis-tab.component';
import { TrainingTabComponent } from './pages/dashboard/tabs/training-tab.component';
import { ProfileTabComponent } from './pages/dashboard/tabs/profile-tab.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', component: LandingComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'risk', component: RiskComponent, canActivate: [authGuard] },
      {
        path: 'dashboard',
        component: CandidateDashboardComponent,
        canActivate: [authGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'upload-cv' },
          { path: 'upload-cv', component: UploadCvTabComponent },
          { path: 'match', component: MatchTabComponent },
          { path: 'job-analysis', component: JobAnalysisTabComponent },
          { path: 'training', component: TrainingTabComponent },
          { path: 'profile', component: ProfileTabComponent }
        ]
      },
      { path: '**', component: NotFoundComponent }
    ]
  }
];
