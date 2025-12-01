import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../../services/backend.service';
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

  subjects: any[] = [];
  grouped: Record<number, any[]> = {};

  // Filtros
  filters = {
    available: false,
    approved: false,
    pending: false,
    blocked: false
  };

  availabilitySnapshot: Record<number,boolean> = {};

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    this.planId = Number(this.route.snapshot.paramMap.get("planId"));

    const userRes = await this.supabase.getUser();
    if (!userRes?.data?.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = userRes.data.user.id;

    this.loadData();
  }

loadData() {
  this.backend.getPlanFull(this.planId, this.userId).subscribe({
    next: (resp: any) => {
      const subjects = resp.subjects as any[];

      console.log('plan_full response:', subjects);

      // 1) Diccionario global: subjectId -> status
      const statusBySubjectId: Record<number, string> = {};

      subjects.forEach((s) => {
        // soporte varios posibles nombres
        const subjectId =
          s.subject_id ??
          s.subjectId ??
          s.id; // fallback

        const status = s.status || s.user_status || 'sin_cursar';

        if (subjectId != null) {
          statusBySubjectId[subjectId] = status;
        }
      });

      const prevSnapshot = this.availabilitySnapshot || {};
      const newSnapshot: Record<number, boolean> = {};

      // 2) Construimos subjects enriquecidos
      this.subjects = subjects.map((s) => {
        const subjectId =
          s.subject_id ??
          s.subjectId ??
          s.id;

        const planSubjectId = s.plan_subject_id ?? s.planSubjectId;

        const status = s.status || s.user_status || 'sin_cursar';

        const rawPrereqs = s.prerequisites || [];

        const prereqsWithStatus = rawPrereqs.map((p: any) => {
          const prereqSubjectId =
            p.subject_id ??
            p.prereq_subject_id ??
            p.id;

          const prereqStatus = statusBySubjectId[prereqSubjectId] || 'sin_cursar';

          return {
            ...p,
            subject_id: prereqSubjectId,
            currentStatus: prereqStatus
          };
        });

        const hasPrereqs = prereqsWithStatus.length > 0;

        const allApproved = hasPrereqs
          ? prereqsWithStatus.every((p: any) => p.currentStatus === 'aprobada')
          : true;

        const anyNotApproved = hasPrereqs
          ? prereqsWithStatus.some((p: any) => p.currentStatus !== 'aprobada')
          : false;

        const isApproved = status === 'aprobada';
        const isPending = status === 'pendiente_final';
        const isAvailable = allApproved;
        const isBlocked = hasPrereqs && anyNotApproved;

        // snapshot para detectar nuevas disponibles
        const prevAvail = prevSnapshot[planSubjectId];
        newSnapshot[planSubjectId] = isAvailable && !isBlocked;

        const isNewlyUnlocked =
          !isApproved &&
          isAvailable &&
          !isBlocked &&
          prevAvail === false; // antes NO estaba disponible

        return {
          ...s,
          subject_id: subjectId,
          plan_subject_id: planSubjectId,
          status,
          prerequisites: prereqsWithStatus,
          isApproved,
          isPending,
          isAvailable,
          isBlocked,
          isNewlyUnlocked
        };
      });

      // 3) guardamos el snapshot nuevo para la próxima vez
      this.availabilitySnapshot = newSnapshot;

      this.groupByYear();
    },
    error: (err) => {
      console.error('Error cargando materias', err);
    }
  });
}


  groupByYear() {
    this.grouped = {};

    this.subjects.forEach(sub => {
      const y = sub.year_suggested ?? 0;
      if (!this.grouped[y]) this.grouped[y] = [];
      this.grouped[y].push(sub);
    });
  }

  applyFilters(list: any[]) {
    return list.filter(sub => {
      if (this.filters.approved && !sub.isApproved) return false;
      if (this.filters.pending && !sub.isPending) return false;
      if (this.filters.available && !sub.isAvailable) return false;
      if (this.filters.blocked && !sub.isBlocked) return false;
      return true;
    });
  }

  onStatusClick(sub: any, newStatus: string) {
    // si está bloqueada, no se puede cambiar
    if (sub.isBlocked) return;

    // si ya está en ese estado, no hago nada
    if (sub.status === newStatus) return;

    this.backend.updateUserSubjectStatus({
      user_id: this.userId,
      plan_subject_id: sub.plan_subject_id,
      status: newStatus
    }).subscribe({
      next: () => {
        // actualizo localmente y recargo para recalcular bloqueos/habilitaciones
        sub.status = newStatus;
        this.loadData();
      },
      error: () => {
        alert("Error guardando estado de la materia");
      }
    });
  }

}
