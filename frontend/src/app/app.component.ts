import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { BackendService } from './services/backend.service';
import { HeaderComponent } from './pages/header/header.component';
import { ProfileModalComponent } from './pages/profile-modal/profile-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ProfileModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  showProfileModal = false;

  userName = '';
  fullName = '';
  email = '';

  activeCareer = '';
  activePlan = '';

  constructor(
    private supabase: SupabaseService,
    private backend: BackendService,
    private router: Router
  ) {}

  async ngOnInit() {
    const res = await this.supabase.getUser();
    const u = res?.data?.user;

    if (!u) {
      this.router.navigate(['/login']);
      return;
    }

    this.email = u.email ?? '';
    this.fullName = u.user_metadata?.['full_name'] ?? '';
    this.userName = this.fullName || (this.email.split('@')[0] ?? 'Usuario');

    // Cargar perfil
    this.backend.getUserProfile(u.id).subscribe(profile => {
      if (!profile || !profile.plan_id) {
        // SI NO TIENE PERFIL → forzar setup inicial
        this.router.navigate(['/setup-profile']);
        return;
      }

      // SI TIENE PERFIL → actualizar header
      this.activeCareer = profile.career_name;
      this.activePlan = profile.plan_name;

      // Redirigir a materias
      this.router.navigate(['/subjects']);
    });
  }

  /* === HEADER EVENTS === */

  onOpenProfile() {
    this.showProfileModal = true;
  }

  async onSaveProfile(data: { fullName: string }) {
    this.fullName = data.fullName;
    this.userName = data.fullName;

    await this.supabase.updateProfileFullName(data.fullName);

    this.showProfileModal = false;
  }

  onCloseProfile() {
    this.showProfileModal = false;
  }

  onLogout() {
    this.supabase.logout();
    this.router.navigate(['/login']);
  }

  onGoHome() {
    this.router.navigate(['/home']);
  }

  onChangePlan() {
    this.router.navigate(['/setup-profile']);
  }
}
