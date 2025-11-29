import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlanSubjectDto {
  plan_subject_id: number;       // 👈 id de la tabla plan_subjects
  subject_id: number;            // 👈 id de la tabla subjects
  code: string;
  name: string;
  year_suggested: number | null;
  semester_suggested: number | null;
  is_elective: boolean;
}



export interface UserSubjectDto {
  id: number;
  user_id: string;
  plan_subject_id: number;
  status: string;
}


@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private API = 'https://uni-materias-backend.onrender.com/api';

  constructor(private http: HttpClient) {}

  // === carreras ===
  getCareers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/careers`);
  }

  getPlans(careerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/plans`, {
      params: { career_id: careerId }
    });
  }

  getPlanSubjects(planId: number): Observable<PlanSubjectDto[]> {
    return this.http.get<PlanSubjectDto[]>(`${this.API}/plan_subjects`, {
      params: { plan_id: planId }
    });
  }

  // === perfil ===
  getUserProfile(userId: string): Observable<any | null> {
    return this.http.get<any>(`${this.API}/user_profile`, {
      params: { user_id: userId }
    });
  }

  saveUserProfile(payload: any): Observable<any> {
    return this.http.post(`${this.API}/user_profile`, payload);
  }

  // === user subjects ===
  getUserSubjects(userId: string): Observable<UserSubjectDto[]> {
    return this.http.get<UserSubjectDto[]>(`${this.API}/user_subjects`, {
      params: { user_id: userId }
    });
  }

  updateUserSubjectStatus(payload: any): Observable<any> {
    return this.http.post(`${this.API}/user_subjects`, payload);
  }

  // === correlatividades ===
  getSubjectCorrelatives(subjectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/subject_correlatives`, {
      params: { subject_id: subjectId }
    });
  }

getPlanFull(planId: number, userId: string): Observable<any> {
  return this.http.get(`${this.API}/plan_full`, {
    params: {
      plan_id: planId,
      user_id: userId
    }
  });
}


}
