import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

export const routes: Routes = [
  // Raíz → redirige a /login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Home (lazy standalone)
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
  },

  // Setup de perfil
  {
    path: 'setup-profile',
    loadComponent: () =>
      import('./pages/setup-profile/setup-profile.component')
        .then(m => m.SetupProfileComponent),
  },

  // Subjects sin planId
  {
    path: 'subjects',
    loadComponent: () =>
      import('./pages/subjects/subjects.component')
        .then(m => m.SubjectsComponent),
  },

  // Subjects con planId
  {
    path: 'subjects/:planId',
    loadComponent: () =>
      import('./pages/subjects/subjects.component')
        .then(m => m.SubjectsComponent),
  },

  // Cualquier otra ruta → login
  { path: '**', redirectTo: 'login' },
];
