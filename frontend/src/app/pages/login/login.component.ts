import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { BackendService } from '../../services/backend.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private backend: BackendService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    // Si ya hay sesión guardada, no mostrar login
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);   // o '/subjects'
    }
  }

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
    // 1) Obtener usuario de Supabase
    // ---------------------------------------------------
    const userRes = await this.supabase.getUser();
    const user = userRes?.data?.user;

    if (!user) {
      alert("Error cargando usuario");
      return;
    }

    // Guardar user_id para usarlo en todo el frontend
    this.auth.setUserId(user.id);

    // ---------------------------------------------------
    // 2) Obtener perfil desde backend
    // ---------------------------------------------------
    this.backend.getUserProfile(user.id).subscribe({
      next: (profile) => {
          // Si llegó acá, el perfil existe
          this.router.navigate(['/subjects',profile.plan_id]);
      },
      error: (err) => {
        console.error(err);
        if (err.status===404) {
          //No existe el perfil --> configurar carrera/plan
          this.router.navigate(['/setup-profile']);
        } else {
          alert("Error obteniendo el perfil")
        }
      }
    });
  }

  register() {
    this.router.navigate(['/register']);
  }
}
