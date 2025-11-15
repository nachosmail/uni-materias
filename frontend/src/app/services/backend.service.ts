// src/app/services/backend.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private API = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // ===== CARRERAS =====
  getCareers(): Observable<any> {
    return this.http.get(`${this.API}/careers`);
  }

  // ===== PLANES =====
  getPlans(careerId: number): Observable<any> {
    return this.http.get(`${this.API}/plans?career_id=${careerId}`);
  }

  // ===== MATERIAS DE UN PLAN =====
  getPlanSubjects(planId: number): Observable<any> {
    return this.http.get(`${this.API}/plan_subjects?plan_id=${planId}`);
  }

  // ===== PERFIL DE USUARIO (carrera + plan) =====
  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${this.API}/user_profile`, {
      params: { user_id: userId }
    });
  }

  saveUserProfile(payload: { user_id: string; career_id: number; plan_id: number }): Observable<any> {
    return this.http.post(`${this.API}/user_profile`, payload);
  }

  // ===== ESTADO DE MATERIAS DEL USUARIO =====
  getUserSubjects(userId: string): Observable<any> {
    return this.http.get(`${this.API}/user_subjects`, {
      params: { user_id: userId }
    });
  }

  updateUserSubjectStatus(payload: {
    user_id: string;
    subject_id: number;
    status: string;
  }): Observable<any> {
    return this.http.post(`${this.API}/user_subjects`, payload);
  }

  // ===== CORRELATIVIDADES DETALLADAS =====
  getSubjectCorrelatives(subjectId: number): Observable<any> {
    return this.http.get(`${this.API}/subject_correlatives`, {
      params: { subject_id: subjectId }
    });
  }
}
