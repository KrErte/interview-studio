import { Routes } from '@angular/router';
import { PublicShellComponent } from './layout/public-shell.component';
import { AppShellComponent } from './layout/app-shell.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './core/auth/auth.guard';
import { uiModeCanMatch } from './core/guards/ui-mode.guard';
import { PivotRolesPageComponent } from './pages/candidate/pivot-roles/pivot-roles.page';
import { FutureproofRoadmapPageComponent } from './pages/candidate/pivot-roles/futureproof-roadmap.page';

export const routes: Routes = [
  // Public pages (landing, auth)
  {
    path: '',
    component: PublicShellComponent,
    children: [
      { path: '', pathMatch: 'full', component: LandingComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  // NEW: Skill Assessment Onboarding (no auth, entry point)
  {
    path: 'start',
    component: AppShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/onboarding/skill-assessment.component').then(
            (m) => m.SkillAssessmentComponent
          )
      }
    ]
  },
  // NEW: Job Analyzer Tool (no auth, public tool)
  {
    path: 'tools',
    component: AppShellComponent,
    children: [
      {
        path: 'job-analyzer',
        loadComponent: () =>
          import('./pages/tools/job-analyzer.component').then(
            (m) => m.JobAnalyzerComponent
          )
      }
    ]
  },
  // NEW: Arena - Interactive Training Tools (unique features)
  // With Simple/Advanced mode-based routing
  {
    path: 'arena',
    component: AppShellComponent,
    children: [
      {
        path: 'interview',
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/interview-interrogation.component').then(
            (m) => m.InterviewInterrogationComponent
          )
      },
      // Salary Negotiation - Simple Mode
      {
        path: 'negotiation',
        canMatch: [uiModeCanMatch('simple')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/salary-negotiation-dojo-simple.component').then(
            (m) => m.SalaryNegotiationDojoSimpleComponent
          )
      },
      // Salary Negotiation - Advanced Mode
      {
        path: 'negotiation',
        canMatch: [uiModeCanMatch('advanced')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/salary-negotiation-dojo.component').then(
            (m) => m.SalaryNegotiationDojoComponent
          )
      },
      // Brutal Truth - Simple Mode
      {
        path: 'truth',
        canMatch: [uiModeCanMatch('simple')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/brutal-truth-machine-simple.component').then(
            (m) => m.BrutalTruthMachineSimpleComponent
          )
      },
      // Brutal Truth - Advanced Mode
      {
        path: 'truth',
        canMatch: [uiModeCanMatch('advanced')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/brutal-truth-machine.component').then(
            (m) => m.BrutalTruthMachineComponent
          )
      },
      // Career Stress Test - Simple Mode
      {
        path: 'stress-test',
        canMatch: [uiModeCanMatch('simple')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/career-stress-test-simple.component').then(
            (m) => m.CareerStressTestSimpleComponent
          )
      },
      // Career Stress Test - Advanced Mode
      {
        path: 'stress-test',
        canMatch: [uiModeCanMatch('advanced')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/career-stress-test.component').then(
            (m) => m.CareerStressTestComponent
          )
      }
    ]
  },
  // Assessment flow - NO auth required (public can do assessment)
  {
    path: 'futureproof',
    component: AppShellComponent,
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
      {
        path: 'career-intel',
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/career-intel.page').then(
            (m) => m.CareerIntelPage
          )
      },
      // Roadmap requires auth - this is where we gate registration
      {
        path: 'roadmap',
        component: FutureproofRoadmapPageComponent,
        canActivate: [authGuard]
      }
    ]
  },
  // Redirect /analysis to futureproof/assessment (for questionnaire completion)
  {
    path: 'analysis',
    redirectTo: 'futureproof/assessment',
    pathMatch: 'full'
  },
  // 404
  { path: '**', component: NotFoundComponent }
];
