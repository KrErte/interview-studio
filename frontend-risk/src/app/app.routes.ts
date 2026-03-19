import { Routes } from '@angular/router';
import { PublicShellComponent } from './layout/public-shell.component';
import { AppShellComponent } from './layout/app-shell.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './core/auth/auth.guard';
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
  // Arena - AI-Powered Career Tools
  {
    path: 'arena',
    component: AppShellComponent,
    children: [
      {
        path: 'interview-simulator',
        canActivate: [authGuard, tierGuard('ARENA_PRO')],
        loadComponent: () =>
          import('./pages/arena/interview-simulator.component').then(
            (m) => m.InterviewSimulatorComponent
          )
      },
      {
        path: 'salary-coach',
        canActivate: [authGuard, tierGuard('ARENA_PRO')],
        loadComponent: () =>
          import('./pages/arena/salary-coach.component').then(
            (m) => m.SalaryCoachComponent
          )
      },
      {
        path: 'cv-optimizer',
        canActivate: [authGuard, tierGuard('ARENA_PRO')],
        loadComponent: () =>
          import('./pages/arena/cv-optimizer.component').then(
            (m) => m.CvOptimizerComponent
          )
      },
      {
        path: 'career-mentor',
        canActivate: [authGuard, tierGuard('ARENA_PRO')],
        loadComponent: () =>
          import('./pages/arena/career-mentor.component').then(
            (m) => m.CareerMentorComponent
          )
      },
      {
        path: 'company-prep',
        canActivate: [authGuard, tierGuard('ARENA_PRO')],
        loadComponent: () =>
          import('./pages/arena/company-prep.component').then(
            (m) => m.CompanyPrepComponent
          )
      },
      {
        path: 'linkedin-generator',
        canActivate: [authGuard, tierGuard('ARENA_PRO')],
        loadComponent: () =>
          import('./pages/arena/linkedin-generator.component').then(
            (m) => m.LinkedinGeneratorComponent
          )
      },
      {
        path: 'cover-letter',
        canActivate: [authGuard, tierGuard('ARENA_PRO')],
        loadComponent: () =>
          import('./pages/arena/cover-letter.component').then(
            (m) => m.CoverLetterComponent
          )
      },
      {
        path: 'salary-benchmark',
        canActivate: [authGuard, tierGuard('ARENA_PRO')],
        loadComponent: () =>
          import('./pages/arena/salary-benchmark.component').then(
            (m) => m.SalaryBenchmarkComponent
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
        canActivate: [authGuard, tierGuard('STARTER')]
      }
    ]
  },
  // Legal & info pages (public)
  {
    path: '',
    component: PublicShellComponent,
    children: [
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/legal/about.component').then(
            (m) => m.AboutComponent
          )
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./pages/legal/privacy.component').then(
            (m) => m.PrivacyComponent
          )
      },
      {
        path: 'terms',
        loadComponent: () =>
          import('./pages/legal/terms.component').then(
            (m) => m.TermsComponent
          )
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/legal/contact.component').then(
            (m) => m.ContactComponent
          )
      }
    ]
  },
  // Redirects
  { path: 'analysis', redirectTo: 'careerrisk/assessment', pathMatch: 'full' },
  { path: 'plans', redirectTo: 'pricing', pathMatch: 'full' },
  // 404
  { path: '**', component: NotFoundComponent }
];
