import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenKey = 'adsha_driver_token';
  private refreshTokenKey = 'adsha_driver_refresh_token';

  constructor(private http: HttpClient) {
    // Initialize user state from stored token
    this.initializeAuthState();
  }

  private initializeAuthState() {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      // Token exists and is valid, get user profile
      this.getUserProfile().subscribe();
    }
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.data.accessToken);
          this.setRefreshToken(response.data.refreshToken);
          this.currentUserSubject.next(response.data.user);
        }
      }),
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
      ...userData,
      role: 'driver'
    }).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.data.accessToken);
          this.setRefreshToken(response.data.refreshToken);
          this.currentUserSubject.next(response.data.user);
        }
      }),
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  // OTP-based authentication methods
  sendOTP(phone: string): Observable<{success: boolean, message: string, data?: any}> {
    return this.http.post<{success: boolean, message: string, data?: any}>(`${environment.apiUrl}/auth/send-otp`, {
      phone
    }).pipe(
      catchError(error => {
        console.error('Send OTP error:', error);
        return of({success: false, message: error.error?.message || 'Failed to send OTP'});
      })
    );
  }

  loginWithOTP(phone: string, otp: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login-otp`, {
      phone,
      otp
    }).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.data.accessToken);
          this.setRefreshToken(response.data.refreshToken);
          this.currentUserSubject.next(response.data.user);
        }
      }),
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  registerWithOTP(userData: {
    phone: string;
    otp: string;
    firstName: string;
    lastName: string;
  }): Observable<boolean> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register-otp`, {
      ...userData,
      role: 'driver'
    }).pipe(
      tap(response => {
        if (response.success) {
          this.setToken(response.data.accessToken);
          this.setRefreshToken(response.data.refreshToken);
          this.currentUserSubject.next(response.data.user);
        }
      }),
      map(response => response.success),
      catchError(() => of(false))
    );
  }

  logout(): Observable<boolean> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearTokens();
        this.currentUserSubject.next(null);
      }),
      map(() => true),
      catchError(() => {
        // Clear tokens even if logout request fails
        this.clearTokens();
        this.currentUserSubject.next(null);
        return of(true);
      })
    );
  }

  getUserProfile(): Observable<User | null> {
    return this.http.get<{success: boolean, data: User}>(`${environment.apiUrl}/users/profile`).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data);
        }
      }),
      map(response => response.success ? response.data : null),
      catchError(() => {
        this.clearTokens();
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  updateProfile(userData: Partial<User>): Observable<boolean> {
    return this.http.put<{success: boolean, data: User}>(`${environment.apiUrl}/users/profile`, userData).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.data);
        }
      }),
      map(response => response.success)
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<boolean> {
    return this.http.put<{success: boolean}>(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword
    }).pipe(
      map(response => response.success)
    );
  }

  checkAuthStatus(): Observable<boolean> {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) {
      return of(false);
    }

    // If we have a current user, return true
    if (this.currentUserSubject.value) {
      return of(true);
    }

    // Otherwise, try to get user profile
    return this.getUserProfile().pipe(
      map(user => user !== null)
    );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch {
      return true;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}