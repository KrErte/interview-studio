import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type HttpOptions = {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  withCredentials?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly base = environment.apiBaseUrl?.replace(/\/$/, '') || '';

  constructor(private http: HttpClient) {}

  get<T>(path: string, options: HttpOptions = {}): Observable<T> {
    return this.http.get<T>(this.toUrl(path), options);
  }

  post<T>(path: string, body: any, options: HttpOptions = {}): Observable<T> {
    return this.http.post<T>(this.toUrl(path), body, options);
  }

  private toUrl(path: string): string {
    const cleaned = path.startsWith('/') ? path : `/${path}`;
    return `${this.base}${cleaned}`;
  }
}

