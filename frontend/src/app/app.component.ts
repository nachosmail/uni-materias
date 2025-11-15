import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
    private backend: BackendService
  ) {}

  async ngOnInit() {
    const res = await this.supabase.getUser();
    const u = res?.data?.user;

    if (u) {
      this.email = u.email ?? '';

      // ACCESO CORRECTO AL METADATA
      this.fullName = u.user_metadata?.['full_name'] ?? '';
      this.userName = this.fullName || (this.email.split('@')[0] ?? 'Usuario');

      this.backend.getUserProfile(u.id).subscribe(p => {
        if (p) {
          this.activeCareer = p.career_name;
          this.activePlan = p.plan_name;
        }
      });
    }
  }

  /* === HEADER EVENTS === */

  onOpenProfile() {
    this.showProfileModal = true;
  }

  async onSaveProfile(data: { fullName: string }) {
    this.fullName = data.fullName;
    this.userName = data.fullName;

    // LLAMADA CORRECTA AL MÉTODO CREADO
    await this.supabase.updateProfileFullName(data.fullName);

    this.showProfileModal = false;
  }

  onCloseProfile() {
    this.showProfileModal = false;
  }

  onLogout() {
    this.supabase.logout();
  }

  onGoHome() {
    // implementar luego
  }

  onChangePlan() {
    // implementar luego
  }
}
