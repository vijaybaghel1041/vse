import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:8080/auth/login';
  private refreshApi = 'http://localhost:8080/auth/refresh';
  private registerApi = 'http://localhost:8080/auth/register';

  constructor(private http: HttpClient) {}

  register(username: string, email: string, password: string, phone: string, role: string = 'MEMBER') {
    return this.http.post(this.registerApi, { username, email, password, phone, role });
  }

  login(username: string, password: string) {
    return this.http.post<{ accessToken: string, refreshToken: string }>(this.api, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
        })
      );
  }

  refresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<{ accessToken: string, refreshToken: string }>(this.refreshApi, { refreshToken })
      .pipe(
        tap(response => {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getUserRole(): string | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (e) {
      return null;
    }
  }

}
