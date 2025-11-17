import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

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
    private supabase: SupabaseService
  ) {}

async login() {
  const { data, error } = await this.supabase.login(this.email, this.password);

  if (error || !data.session) {
    alert("Error en login: " + error?.message);
    return;
  }

  // Guardamos el token MANUALMENTE (sin Supabase Locks)
  localStorage.setItem('access_token', data.session.access_token);

  this.router.navigate(['/home']);
}



  register() {
    console.log("Registro");
    this.router.navigate(['/register'])
  }
}
