import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../../services/backend.service';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';

interface SubjectRow {
  id: number;
  code: string;
  name: string;
  year_suggested: number | null;
  semester_suggested: number | null;
  is_elective: boolean;
  prerequisites: { id: number; code: string; name: string }[];
  status: 'approved' | 'in_progress' | 'pending';
}

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.scss']
})
export class SubjectsComponent implements OnInit {

  planId!: number;
  userId: string | null = null;

  subjects: SubjectRow[] = [];

  // resumen
  totalSubjects = 0;
  approvedCount = 0;
  inProgressCount = 0;
  pendingCount = 0;
  availableCount = 0;

  // detalle seleccionado
  selectedSubject: SubjectRow | null = null;
  detailedCorrels: any | null = null;
  loadingDetail = false;

  loadingSubjects = true;

  // años a mostrar (1° a 5°)
  readonly years: number[] = [1, 2, 3, 4, 5];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private backend: BackendService,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadCurrentUser();

    this.planId = Number(this.route.snapshot.paramMap.get('planId'));
    if (!this.planId) {
      alert('Plan inválido');
      this.router.navigate(['/home']);
      return;
    }

    this.loadSubjects();
  }

  private async loadCurrentUser() {
    const res = await this.supabase.getUser();
    const user = res?.data?.user;
    if (!user) {
      this.router.navigate(['/']);
      return;
    }
    this.userId = user.id;
  }

  loadSubjects() {
    if (!this.userId) return;

    this.loadingSubjects = true;

    // 1) Traemos materias del plan
    this.backend.getPlanSubjects(this.planId).subscribe({
      next: (subjectsData) => {
        // 2) Traemos estados del usuario
        this.backend.getUserSubjects(this.userId!).subscribe({
          next: (userStates) => {
            const stateMap: Record<number, string> = {};
            for (const us of userStates) {
              stateMap[us.subject_id] = us.status;
            }

            this.subjects = subjectsData.map((s: any) => ({
              ...s,
              status: (stateMap[s.id] as any) || 'pending'
            }));

            this.recalculateSummary();
          },
          error: (err) => {
            console.error('Error cargando estados de materias', err);
          },
          complete: () => {
            this.loadingSubjects = false;
          }
        });
      },
      error: (err) => {
        console.error('Error cargando materias del plan', err);
        this.loadingSubjects = false;
      }
    });
  }

  recalculateSummary() {
    this.totalSubjects = this.subjects.length;
    this.approvedCount = this.subjects.filter(s => s.status === 'approved').length;
    this.inProgressCount = this.subjects.filter(s => s.status === 'in_progress').length;
    this.pendingCount = this.subjects.filter(s => s.status === 'pending').length;

    // "Disponibles": todas las que no estén aprobadas y cuyas correlativas estén aprobadas
    this.availableCount = this.subjects.filter(s => {
      if (s.status === 'approved') return false;
      if (!s.prerequisites || s.prerequisites.length === 0) return true;
      // todas las correlativas deben estar aprobadas
      return s.prerequisites.every(pr =>
        this.subjects.some(ss => ss.id === pr.id && ss.status === 'approved')
      );
    }).length;
  }

  changeStatus(subject: SubjectRow, newStatus: 'approved' | 'in_progress' | 'pending') {
    if (!this.userId) return;

    subject.status = newStatus;
    this.recalculateSummary();

    this.backend.updateUserSubjectStatus({
      user_id: this.userId,
      subject_id: subject.id,
      status: newStatus
    }).subscribe({
      error: (err) => {
        console.error('Error actualizando estado', err);
        alert('Error guardando estado de la materia');
      }
    });
  }

  openDetail(subject: SubjectRow) {
    this.selectedSubject = subject;
    this.detailedCorrels = null;
    this.loadingDetail = true;

    this.backend.getSubjectCorrelatives(subject.id).subscribe({
      next: (data) => {
        this.detailedCorrels = data;
      },
      error: (err) => {
        console.error('Error cargando correlatividades', err);
      },
      complete: () => {
        this.loadingDetail = false;
      }
    });
  }

  backToHome() {
    this.router.navigate(['/home']);
  }

  // ========= HELPERS PARA EL TEMPLATE (evitan arrow functions en HTML) =========

  hasSubjectsForYear(year: number): boolean {
    return this.subjects.some(s => s.year_suggested === year);
  }

  getSubjectsByYear(year: number): SubjectRow[] {
    return this.subjects.filter(s => s.year_suggested === year);
  }

  hasSubjectsWithoutYear(): boolean {
    return this.subjects.some(s => !s.year_suggested);
  }

  getSubjectsWithoutYear(): SubjectRow[] {
    return this.subjects.filter(s => !s.year_suggested);
  }

  formatPrereqCodes(subject: SubjectRow): string {
    if (!subject.prerequisites || subject.prerequisites.length === 0) return '';
    return subject.prerequisites.map(p => p.code).join(', ');
  }
}
