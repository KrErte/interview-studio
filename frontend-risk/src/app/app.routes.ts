import { Routes } from '@angular/router';
import { PublicShellComponent } from './layout/public-shell.component';
import { AppShellComponent } from './layout/app-shell.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './core/auth/auth.guard';
import { uiModeCanMatch } from './core/guards/ui-mode.guard';
import { tierGuard } from './core/guards/tier.guard';
import { PivotRolesPageComponent } from './pages/candidate/pivot-roles/pivot-roles.page';
import { CareerriskRoadmapPageComponent } from './pages/candidate/pivot-roles/careerrisk-roadmap.page';

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
  // Session wizards (public, no auth for simple mode)
  {
    path: 'session',
    component: PublicShellComponent,
    children: [
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/session/session-wizard.component').then(
            (m) => m.SessionWizardComponent
          )
      },
      {
        path: 'new/advanced',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/session/session-wizard-advanced.component').then(
            (m) => m.SessionWizardAdvancedComponent
          )
      }
    ]
  },
  // Session result view (public - accessible by ID)
  {
    path: 'session/:id',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/session/session-result.component').then(
            (m) => m.SessionResultComponent
          )
      }
    ]
  },
  // Shared report (public)
  {
    path: 'share/:shareId',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/session/share-report.component').then(
            (m) => m.ShareReportComponent
          )
      }
    ]
  },
  // Session history (auth required)
  {
    path: 'history',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/session/session-history.component').then(
            (m) => m.SessionHistoryComponent
          )
      }
    ]
  },
  // Pricing (public, no auth required)
  {
    path: 'pricing',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/pricing/pricing.component').then(
            (m) => m.PricingComponent
          )
      }
    ]
  },
  // Payment success (auth required)
  {
    path: 'payment',
    component: AppShellComponent,
    children: [
      {
        path: 'success',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/pricing/payment-success.component').then(
            (m) => m.PaymentSuccessComponent
          )
      }
    ]
  },
  // Skill Assessment Onboarding (no auth, entry point)
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
  // Job Analyzer Tool (no auth, public tool)
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
  // Arena - Interactive Training Tools (requires PROFESSIONAL tier)
  {
    path: 'arena',
    component: AppShellComponent,
    canActivate: [authGuard, tierGuard('PROFESSIONAL')],
    children: [
      {
        path: 'interview',
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/interview-interrogation.component').then(
            (m) => m.InterviewInterrogationComponent
          )
      },
      {
        path: 'negotiation',
        canMatch: [uiModeCanMatch('simple')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/salary-negotiation-dojo-simple.component').then(
            (m) => m.SalaryNegotiationDojoSimpleComponent
          )
      },
      {
        path: 'negotiation',
        canMatch: [uiModeCanMatch('advanced')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/salary-negotiation-dojo.component').then(
            (m) => m.SalaryNegotiationDojoComponent
          )
      },
      {
        path: 'truth',
        canMatch: [uiModeCanMatch('simple')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/brutal-truth-machine-simple.component').then(
            (m) => m.BrutalTruthMachineSimpleComponent
          )
      },
      {
        path: 'truth',
        canMatch: [uiModeCanMatch('advanced')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/brutal-truth-machine.component').then(
            (m) => m.BrutalTruthMachineComponent
          )
      },
      {
        path: 'stress-test',
        canMatch: [uiModeCanMatch('simple')],
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/career-stress-test-simple.component').then(
            (m) => m.CareerStressTestSimpleComponent
          )
      },
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
  // Assessment flow - NO auth required
  {
    path: 'careerrisk',
    component: AppShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', component: PivotRolesPageComponent },
      {
        path: 'questions',
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/careerrisk-questions.page').then(
            (m) => m.CareerriskQuestionsPageComponent
          )
      },
      {
        path: 'assessment',
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/careerrisk-assessment.page').then(
            (m) => m.CareerriskAssessmentPageComponent
          )
      },
      {
        path: 'career-intel',
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/career-intel.page').then(
            (m) => m.CareerIntelPage
          )
      },
      {
        path: 'roadmap',
        component: CareerriskRoadmapPageComponent,
        canActivate: [authGuard, tierGuard('PROFESSIONAL')]
      }
    ]
  },
  // Redirects
  { path: 'analysis', redirectTo: 'careerrisk/assessment', pathMatch: 'full' },
  { path: 'plans', redirectTo: 'pricing', pathMatch: 'full' },
  // 404
  { path: '**', component: NotFoundComponent }
];
