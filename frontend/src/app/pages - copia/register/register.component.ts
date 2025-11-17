import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  email = '';
  password = '';

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {}

  goBack() {
    this.router.navigate(['/']);
  }

  async register() {
  const { email, password } = this;

  const { data, error } = await this.supabase.register(email, password);

  if (error) {
    alert("Error al crear usuario: " + error.message);
    return;
  }

  alert("Cuenta creada. Revisa tu email para confirmar.");

  this.router.navigate(['/']);
}
 
}
