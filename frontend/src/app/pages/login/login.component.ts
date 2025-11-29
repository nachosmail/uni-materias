import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email = '';
  password = '';

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private backend: BackendService
  ) {}

async login() {
  const { data, error } = await this.supabase.login(this.email, this.password);

  if (error || !data.session) {
    alert("Error en login: " + error?.message);
    return;
  }

  const access = data.session.access_token;
  const refresh = data.session.refresh_token ?? data.session.access_token;

  localStorage.setItem("access_token", access);

  await this.supabase.setSession(access, refresh);

  // ---------------------------------------------------
  // 1) Obtener usuario
  // ---------------------------------------------------
  const userRes = await this.supabase.getUser();
  const user = userRes?.data?.user;

  if (!user) {
    alert("Error cargando usuario");
    return;
  }

  // ---------------------------------------------------
  // 2) Obtener perfil desde backend
  // ---------------------------------------------------
  this.backend.getUserProfile(user.id).subscribe({
    next: (profile) => {
      if (!profile) {
        // ==> PRIMERA VEZ: no existe perfil
        this.router.navigate(['/setup-profile']);
      } else {
        // ==> Tiene carrera/plan cargados → ir directo a materias
        this.router.navigate(['/subjects', profile.plan_id]);
      }
    },
    error: () => {
      alert("Error obteniendo perfil");
    }
  });
}






  register() {
    console.log("Registro");
    this.router.navigate(['/register'])
  }
}
