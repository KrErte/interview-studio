import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Interview Studio V2 routes.
 *
 * Flow:
 * - / → Landing (choose mode)
 * - /session/new → Simple Mode wizard (3 steps, no auth)
 * - /session/new/advanced → Advanced Mode wizard (5 steps, auth required)
 * - /session/:id → Session result view
 * - /session/:id/full → Paid result view (deprecated, use /session/:id)
 * - /share/:shareId → Public shareable report
 * - /history → Session history (auth required)
 * - /pricing → Pricing page
 * - /login → Login
 * - /register → Register
 */
export const routes: Routes = [
  // Landing
  {
    path: '',
    loadComponent: () => import('./v2/landing/landing.component').then(m => m.LandingComponent),
  },

  // Session creation
  {
    path: 'session/new',
    loadComponent: () => import('./v2/session-new/session-new.component').then(m => m.SessionNewComponent),
  },
  {
    path: 'session/new/advanced',
    loadComponent: () => import('./v2/session-advanced/session-advanced.component').then(m => m.SessionAdvancedComponent),
  },

  // Session view
  {
    path: 'session/:id',
    loadComponent: () => import('./v2/session-view/session-view.component').then(m => m.SessionViewComponent),
  },
  {
    path: 'session/:id/full',
    redirectTo: 'session/:id',
  },

  // Public share
  {
    path: 'share/:shareId',
    loadComponent: () => import('./v2/share/share.component').then(m => m.ShareComponent),
  },

  // History (auth required)
  {
    path: 'history',
    loadComponent: () => import('./v2/history/history.component').then(m => m.HistoryComponent),
    canActivate: [authGuard],
  },

  // Pricing
  {
    path: 'pricing',
    loadComponent: () => import('./v2/pricing/pricing.component').then(m => m.PricingComponent),
  },

  // Auth
  {
    path: 'login',
    loadComponent: () => import('./v2/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./v2/auth/register/register.component').then(m => m.RegisterComponent),
  },

  // V1 routes (legacy support)
  {
    path: 'v1',
    children: [
      {
        path: '',
        loadComponent: () => import('./v1/landing/landing.component').then(m => m.LandingComponent),
      },
      {
        path: 'upload',
        loadComponent: () => import('./v1/upload/upload.component').then(m => m.UploadComponent),
      },
      {
        path: 'questionnaire',
        loadComponent: () => import('./v1/questionnaire/questionnaire.component').then(m => m.QuestionnaireComponent),
      },
      {
        path: 'result/:id',
        loadComponent: () => import('./v1/free-result/free-result.component').then(m => m.FreeResultComponent),
      },
      {
        path: 'result/:id/paid',
        loadComponent: () => import('./v1/paid-result/paid-result.component').then(m => m.PaidResultComponent),
      },
    ],
  },

  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
