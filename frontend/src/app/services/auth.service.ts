import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'uni_user_id';

  private userIdSubject = new BehaviorSubject<string | null>(null);
  userId$ = this.userIdSubject.asObservable();

  constructor() {
    this.loadUserFromStorage();
  }

  /** Levanta user_id desde localStorage al iniciar la app */
  private loadUserFromStorage(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.userIdSubject.next(stored);
    }
  }

  /** Guardar user_id cuando el login fue exitoso */
  setUserId(userId: string): void {
    localStorage.setItem(this.STORAGE_KEY, userId);
    this.userIdSubject.next(userId);
  }

  /** Borrar sesión */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.userIdSubject.next(null);
  }

  /** Obtener el user_id actual (sincrónico) */
  get currentUserId(): string | null {
    return this.userIdSubject.value;
  }

  /** Saber si hay sesión activa */
  isLoggedIn(): boolean {
    return this.currentUserId !== null;
  }
}
