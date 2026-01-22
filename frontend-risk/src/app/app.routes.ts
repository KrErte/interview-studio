import { Routes } from '@angular/router';
import { PublicShellComponent } from './layout/public-shell.component';
import { AppShellComponent } from './layout/app-shell.component';
import { BusinessShellComponent } from './layout/business-shell.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './core/auth/auth.guard';
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
  // Pricing page (public)
  {
    path: 'pricing',
    loadComponent: () =>
      import('./pages/business/pricing.component').then(m => m.PricingComponent)
  },
  // B2B Business Dashboard (auth required)
  {
    path: 'business',
    component: BusinessShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/business/company-dashboard.component').then(m => m.CompanyDashboardComponent)
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./pages/business/team-management.component').then(m => m.TeamManagementComponent)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./pages/business/analytics-reports.component').then(m => m.AnalyticsReportsComponent)
      },
      {
        path: 'training',
        loadComponent: () =>
          import('./pages/business/training-plans.component').then(m => m.TrainingPlansComponent)
      },
      {
        path: 'integrations',
        loadComponent: () =>
          import('./pages/business/integrations.component').then(m => m.IntegrationsComponent)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/business/business-settings.component').then(m => m.BusinessSettingsComponent)
      }
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
      {
        path: 'negotiation',
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/salary-negotiation-dojo.component').then(
            (m) => m.SalaryNegotiationDojoComponent
          )
      },
      {
        path: 'truth',
        loadComponent: () =>
          import('./pages/candidate/pivot-roles/brutal-truth-machine.component').then(
            (m) => m.BrutalTruthMachineComponent
          )
      },
      {
        path: 'stress-test',
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
  // PRODUCT: Interview Autopsy (public, with paywall)
  {
    path: 'autopsy',
    component: AppShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/product/autopsy/interview-autopsy.component').then(
            m => m.InterviewAutopsyComponent
          )
      }
    ]
  },
  // PRODUCT: Analysis modules
  {
    path: 'analysis',
    component: AppShellComponent,
    children: [
      { path: '', redirectTo: 'recruiter-view', pathMatch: 'full' },
      {
        path: 'recruiter-view',
        loadComponent: () =>
          import('./pages/product/recruiter-view/recruiter-mirror.component').then(
            m => m.RecruiterMirrorComponent
          )
      },
      {
        path: 'delta',
        loadComponent: () =>
          import('./pages/product/confidence-delta/confidence-delta.component').then(
            m => m.ConfidenceDeltaComponent
          )
      },
      {
        path: 'next-72h',
        loadComponent: () =>
          import('./pages/product/action-plan/action-plan-72h.component').then(
            m => m.ActionPlan72hComponent
          )
      }
    ]
  },
  // PRODUCT: Conversion Landing Page
  {
    path: 'product',
    loadComponent: () =>
      import('./pages/product/landing/product-landing.component').then(
        m => m.ProductLandingComponent
      )
  },
  // 404
  { path: '**', component: NotFoundComponent }
];
