import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { BackendService } from './services/backend.service';
import { HeaderComponent } from './pages/header/header.component';
import { ProfileModalComponent } from './pages/profile-modal/profile-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    ProfileModalComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  activeCareerId: number | null = null;
  activePlanId: number | null = null;
  title = 'uni-materias';
  showProfileModal = false;

  userName = '';
  fullName = '';
  email = '';

  activeCareer = '';
  activePlan = '';      // lo guardás como string
  activePlanName = '';

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

this.backend.getUserProfile(u.id).subscribe(profile => {
  console.log("📌 UserProfile recibido desde backend:", profile);

  if (!profile) {
    this.router.navigate(['/setup-profile']);
    return;
  }

  // Guardamos los IDs
  this.activeCareerId = profile.career_id;
  this.activePlanId = profile.plan_id;

  // Para navegar a /subjects más tarde
  this.activePlan = String(profile.plan_id);

  // Cargamos los nombres reales desde las otras APIs
  this.loadCareerAndPlanNames(profile.career_id, profile.plan_id);
});

  }

  private loadCareerAndPlanNames(careerId: number, planId: number) {
  // 1) Nombre de la carrera
  this.backend.getCareers().subscribe({
    next: (careers) => {
      const career = careers.find(c => c.id === careerId);
      this.activeCareer = career?.name ?? `Carrera ${careerId}`;
    },
    error: (err) => {
      console.error('Error cargando carreras', err);
      this.activeCareer = `Carrera ${careerId}`;
    }
  });

  // 2) Nombre del plan (filtrado por career_id)
  this.backend.getPlans(careerId).subscribe({
    next: (plans) => {
      const plan = plans.find(p => p.id === planId);
      this.activePlanName = plan?.name ?? `Plan ${planId}`;
    },
    error: (err) => {
      console.error('Error cargando planes', err);
      this.activePlanName = `Plan ${planId}`;
    }
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

  // 👇 ahora sí home es home
  onGoHome() {
    this.router.navigate(['/home']);
  }

  // 👇 mis materias
  onGoSubjects() {
    if (Number(this.activePlan) > 0) {
      this.router.navigate(['/subjects', this.activePlan]);
    } else {
      // si por alguna razón no hay plan, lo mando a configurar
      this.router.navigate(['/setup-profile']);
    }
  }

  onChangePlan() {
    this.router.navigate(['/setup-profile']);
  }
}
