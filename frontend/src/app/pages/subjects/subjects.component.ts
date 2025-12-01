import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService, PlanSubjectDto } from '../../services/backend.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

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
  // plan_subject_id → estado
  userSubjects: Record<number, string> = {};

  loading = true;

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    // 1) Obtener planId desde la ruta
    this.planId = Number(this.route.snapshot.paramMap.get('planId'));
    if (!this.planId) {
      alert('Plan inválido');
      this.router.navigate(['/home']);
      return;
    }

    // 2) Obtener userId desde AuthService
    const currentUserId = this.auth.currentUserId;
    if (!currentUserId) {
      // En teoría no deberías llegar acá porque authGuard protege la ruta,
      // pero por las dudas…
      this.router.navigate(['/login']);
      return;
    }

    this.userId = currentUserId;

    // 3) Cargar datos
    this.loadData();
  }

  loadData() {
    this.loading = true;

    // No hace falta pasar userId, BackendService lo toma de AuthService
    this.backend.getPlanFull(this.planId).subscribe({
      next: (resp) => {
        console.log('Plan full:', resp);
        this.subjects = resp.subjects;

        resp.subjects.forEach((s: any) => {
          this.userSubjects[s.plan_subject_id] = s.status;
        });

        this.loading = false;
      },
      error: () => {
        console.error('Error cargando materias');
        this.loading = false;
      }
    });
  }

  changeStatus(planSubjectId: number, newStatus: string) {
    this.backend.updateUserSubjectStatus({
      user_id: this.userId,
      plan_subject_id: planSubjectId,
      status: newStatus,
    }).subscribe({
      next: () => {
        // actualizar UI sin recargar todo
        this.userSubjects[planSubjectId] = newStatus;
      },
      error: () => {
        alert('Error guardando estado de la materia');
      }
    });
  }
}
