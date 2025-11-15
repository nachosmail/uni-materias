import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  careers: any[] = [];
  plans: any[] = [];

  selectedCareer: number | null = null;
  selectedPlan: number | null = null;

  loadingCareers = true;
  loadingPlans = false;
  loadingProfile = true;

  userId: string | null = null;

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private backend: BackendService
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();
    await this.loadCareers();
    if (this.userId) {
      await this.loadUserProfile();
    }
  }

  private async loadCurrentUser() {
    const res = await this.supabase.getUser();
    const user = res?.data?.user;
    if (!user) {
      // Si no hay usuario, lo mandamos al login
      this.router.navigate(['/']);
      return;
    }
    this.userId = user.id;
  }

  async loadCareers() {
    this.loadingCareers = true;
    this.backend.getCareers().subscribe({
      next: (data) => {
        this.careers = data;
      },
      error: (err) => {
        console.error('Error cargando carreras', err);
      },
      complete: () => {
        this.loadingCareers = false;
      }
    });
  }

  async loadUserProfile() {
    if (!this.userId) return;
    this.loadingProfile = true;

    this.backend.getUserProfile(this.userId).subscribe({
      next: (profile) => {
        if (profile) {
          this.selectedCareer = profile.career_id;
          // Cargar planes y seleccionar el que corresponde
          this.loadPlans(profile.plan_id);
        }
      },
      error: (err) => {
        console.error('Error cargando perfil de usuario', err);
      },
      complete: () => {
        this.loadingProfile = false;
      }
    });
  }

  loadPlans(preselectPlanId?: number) {
    if (!this.selectedCareer) return;
    this.loadingPlans = true;

    this.backend.getPlans(this.selectedCareer).subscribe({
      next: (data) => {
        this.plans = data;
        if (preselectPlanId) {
          this.selectedPlan = preselectPlanId;
        }
      },
      error: (err) => {
        console.error('Error cargando planes', err);
      },
      complete: () => {
        this.loadingPlans = false;
      }
    });
  }

  onCareerChange() {
    this.selectedPlan = null;
    this.loadPlans();
  }

  saveProfile() {
    if (!this.userId || !this.selectedCareer || !this.selectedPlan) {
      alert('Seleccioná carrera y plan antes de guardar.');
      return;
    }

    this.backend.saveUserProfile({
      user_id: this.userId,
      career_id: this.selectedCareer,
      plan_id: this.selectedPlan
    }).subscribe({
      next: () => {
        alert('Plan guardado como preferido.');
      },
      error: (err) => {
        console.error('Error guardando perfil', err);
        alert('Error guardando perfil.');
      }
    });
  }

  logout() {
    this.supabase.logout();
    this.router.navigate(['/']);
  }

  goToSubjects() {
    if (!this.selectedPlan) {
      alert('Seleccioná un plan');
      return;
    }
    this.router.navigate(['/subjects', this.selectedPlan]);
  }
}
