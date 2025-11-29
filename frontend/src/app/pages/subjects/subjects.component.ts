import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService, PlanSubjectDto, UserSubjectDto } from '../../services/backend.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss']
})
export class SubjectsComponent implements OnInit {

  planId!: number;
  userId!: string;

  subjects: PlanSubjectDto[] = [];
  userSubjects: Record<number, string> = {};  // plan_subject_id → estado

  loading = true;

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    // 1) Obtener planId
    this.planId = Number(this.route.snapshot.paramMap.get("planId"));
    if (!this.planId) {
      alert("Plan inválido");
      this.router.navigate(['/home']);
      return;
    }

    // 2) Obtener usuario de Supabase
    const res = await this.supabase.getUser();
    const u = res?.data?.user;

    if (!u) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = u.id;

    // 3) Cargar todo
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // 1) cargar materias
    this.backend.getPlanFull(this.planId, this.userId).subscribe({
      next: (resp) => {
        console.log("Plan full:",resp)
        this.subjects = resp.subjects;

        resp.subjects.forEach((s: any) => {
          this.userSubjects[s.plan_subject_id] = s.status;
        });

        this.loading = false;
      },
      error: () => {
        console.error("Error cargando materias");
        this.loading = false;
      }
    });
  }

  changeStatus(planSubjectId: number, newStatus: string) {
    this.backend.updateUserSubjectStatus({
      user_id: this.userId,
      plan_subject_id: planSubjectId,
      status: newStatus
    }).subscribe({
      next: () => {
        // actualizar UI sin relogueo
        this.userSubjects[planSubjectId] = newStatus;
      },
      error: () => {
        alert("Error guardando estado de la materia");
      }
    });
  }
}
