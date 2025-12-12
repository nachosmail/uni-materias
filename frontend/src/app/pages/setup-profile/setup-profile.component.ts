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
    const res = await this.supabase.getUser();
    const user = res?.data?.user;

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = user.id;

    this.backend.getCareers().subscribe({
      next: data => this.careers = data || [],
      error: err => {
        console.error('Error cargando carreras', err);
        alert('Error cargando la lista de carreras');
      }
    });
  }

  onCareerChange() {
    this.selectedPlan = null;
    this.plans = [];

    if (!this.selectedCareer) return;

    this.backend.getPlans(this.selectedCareer).subscribe({
      next: data => this.plans = data || [],
      error: err => {
        console.error('Error cargando planes', err);
        alert('Error cargando planes para esta carrera');
      }
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
      next: (resp) => {
        const planId = resp?.plan_id ?? this.selectedPlan!;
        this.router.navigate(['/subjects', planId]);
      },
      error: (err) => {
        console.error('Error guardando perfil', err);
        alert('Error guardando tu perfil');
      }
    });
  }
}
