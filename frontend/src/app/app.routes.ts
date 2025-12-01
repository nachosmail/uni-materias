import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'setup-profile',
    loadComponent: () =>
      import('./pages/setup-profile/setup-profile.component').then(m => m.SetupProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'subjects/:planId',   // 👈👈 antes era solo 'subjects'
    loadComponent: () =>
      import('./pages/subjects/subjects.component').then(m => m.SubjectsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
