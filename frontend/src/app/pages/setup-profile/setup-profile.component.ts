import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SupabaseService } from '../../services/supabase.service';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-setup-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './setup-profile.component.html',
  styleUrls: ['./setup-profile.component.scss']
})
export class SetupProfileComponent implements OnInit {

  careers: any[] = [];
  plans: any[] = [];

  selectedCareer: number | null = null;
  selectedPlan: number | null = null;

  userId: string = '';

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private backend: BackendService
  ) {}

  async ngOnInit() {
    // 1) Obtener usuario actual
    const res = await this.supabase.getUser();
    const user = res?.data?.user;

    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.userId = user.id;

    // 2) Cargar carreras
    this.backend.getCareers().subscribe(data => {
      this.careers = data || [];
    });
  }

  onCareerChange() {
    this.selectedPlan = null;
    if (!this.selectedCareer) return;

    this.backend.getPlans(this.selectedCareer).subscribe(data => {
      this.plans = data || [];
    });
  }

  saveAndContinue() {
    if (!this.selectedCareer || !this.selectedPlan) {
      alert('Debés elegir carrera y plan.');
      return;
    }

    this.backend.saveUserProfile({
      user_id: this.userId,
      career_id: this.selectedCareer,
      plan_id: this.selectedPlan
    }).subscribe({
      next: () => {
        this.router.navigate(['/subjects', this.selectedPlan]);
      },
      error: () => {
        alert('Error guardando tu perfil');
      }
    });
  }
}
