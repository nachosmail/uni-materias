import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RegisterComponent } from './pages/register/register.component';
import { SubjectsComponent } from './pages/subjects/subjects.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'subjects/:planId', component: SubjectsComponent },
  {
  path: 'setup-profile',
  loadComponent: () => import('./pages/setup-profile/setup-profile.component')
    .then(m => m.SetupProfileComponent)
},
{
  path: 'subjects',
  loadComponent: () => import('./pages/subjects/subjects.component')
    .then(m => m.SubjectsComponent)
},
{
  path: 'home',
  loadComponent: () => import('./pages/home/home.component')
    .then(m => m.HomeComponent)
},

];
