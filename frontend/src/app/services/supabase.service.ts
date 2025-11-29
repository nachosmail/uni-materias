import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
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

  // =================== AUTH ===================

  async login(email: string, password: string) {
    return this.client.auth.signInWithPassword({
      email,
      password
    });
  }

  async register(email: string, password: string) {
    return this.client.auth.signUp({
      email,
      password
    });
  }

  // NUEVO → método para setear sesión
  async setSession(access_token: string, refresh_token: string) {
    await this.client.auth.setSession({
      access_token,
      refresh_token
    });
  }

  // GET USER usando el token almacenado
  async getUser() {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    return this.client.auth.getUser(token);
  }

  logout() {
    localStorage.removeItem("access_token");
  }

  // =================== UPDATE PROFILE ===================
  async updateProfileFullName(fullName: string) {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    await this.client.auth.setSession({
      access_token: token,
      refresh_token: token
    });

    await this.client.auth.updateUser({
      data: { full_name: fullName }
    });
  }
}
