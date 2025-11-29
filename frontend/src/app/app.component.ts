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
  activePlan = '';            // ID numérico
  activePlanName = '';       // nombre del plan

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

    this.backend.getUserProfile(u.id).subscribe(p => {
      if (!p) {
        this.router.navigate(['/setup-profile']);
        return;
      }

      this.activeCareer = String(p.career_id);
      this.activePlan = String(p.plan_id);       // numérico
      this.activePlanName = p.plan_name;
    });
  }

  onOpenProfile() { this.showProfileModal = true; }

  async onSaveProfile(data: { fullName: string }) {
    this.fullName = data.fullName;
    this.userName = data.fullName;
    await this.supabase.updateProfileFullName(data.fullName);
    this.showProfileModal = false;
  }

  onCloseProfile() { this.showProfileModal = false; }

  onLogout() {
    this.supabase.logout();
    this.router.navigate(['/login']);
  }

  onGoHome() {
    if (Number(this.activePlan) > 0)
      this.router.navigate(['/subjects', this.activePlan]);
  }


  onChangePlan() {
    this.router.navigate(['/setup-profile']);
  }
}
