import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://whjzdqgiwabydgvsmxex.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoanpkcWdpd2FieWRndnNteGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjQ2MzMsImV4cCI6MjA3ODU0MDYzM30.H88dJVe87gkRMthUx2r_7Cx7hSq1S93b_zko7lQY0xw',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );
  }

  // LOGIN
  login(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  // REGISTER
  register(email: string, password: string) {
    return this.supabase.auth.signUp({
      email,
      password
    });
  }

  // GET USER (manual)
  async getUser() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    return this.supabase.auth.getUser(token);
  }

  // LOGOUT
  logout() {
    localStorage.removeItem('access_token');
  }

  // === NUEVO ===
async updateProfileFullName(fullName: string) {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  // 1) Creamos sesión temporal manualmente
  await this.supabase.auth.setSession({
    access_token: token,
    refresh_token: token
  });

  // 2) Ahora sí actualizamos metadata
  await this.supabase.auth.updateUser({
    data: { full_name: fullName }
  });
}

}
