import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PivotRolesPageComponent } from './pages/candidate/pivot-roles/pivot-roles.page';
import { FutureproofRoadmapPageComponent } from './pages/candidate/pivot-roles/futureproof-roadmap.page';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', component: LandingComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'futureproof', component: PivotRolesPageComponent, canActivate: [authGuard] },
      { path: 'futureproof/roadmap', component: FutureproofRoadmapPageComponent, canActivate: [authGuard] },
      { path: 'risk', redirectTo: 'futureproof', pathMatch: 'full' },
      { path: 'dashboard', redirectTo: 'futureproof', pathMatch: 'full' },
      { path: 'dashboard/futureproof', redirectTo: 'futureproof', pathMatch: 'full' },
      { path: 'dashboard/pivot-roles', redirectTo: 'futureproof', pathMatch: 'full' },
      { path: '**', component: NotFoundComponent }
    ]
  }
];
