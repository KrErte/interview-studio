import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ApiClient } from '../api/api-client.service';
import { TokenStorageService } from './token-storage.service';

export interface AuthResponse {
  token?: string;
  accessToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSubject: BehaviorSubject<string | null>;

  readonly token$;

  constructor(private api: ApiClient, private tokenStorage: TokenStorageService) {
    const initialToken = this.tokenStorage.getToken();
    this.tokenSubject = new BehaviorSubject<string | null>(initialToken);
    this.token$ = this.tokenSubject.asObservable();
  }

  login(email: string, password: string) {
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap((res) => this.persist(res)),
      map(() => void 0)
    );
  }

  register(email: string, password: string, fullName?: string) {
    return this.api.post<AuthResponse>('/auth/register', { email, password, fullName: fullName || 'User' }).pipe(
      tap((res) => this.persist(res)),
      map(() => void 0)
    );
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  logout(): void {
    this.tokenStorage.clear();
    this.tokenSubject.next(null);
  }

  private persist(res: AuthResponse): void {
    const token = res?.accessToken ?? res?.token ?? '';
    if (token) {
      this.tokenStorage.setToken(token);
      this.tokenSubject.next(token);
    }
  }
}
