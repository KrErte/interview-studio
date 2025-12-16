import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-api.service';

export interface TrainingTask {
  taskKey: string;
  completed: boolean;
  completedAt: string | null;
}

export interface TrainingStatus {
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
  tasks: TrainingTask[];
}

@Injectable({ providedIn: 'root' })
export class TrainingApiService {
  private readonly baseUrl = `/api/trainer`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getTrainingStatus(): Observable<TrainingStatus> {
    return this.auth.token$.pipe(
      take(1),
      switchMap((token) => {
        if (!token) {
          return throwError(() => new Error('Not authenticated'));
        }
        return this.http.get<TrainingStatus>(`${this.baseUrl}/status`);
      })
    );
  }

  setTaskCompleted(taskKey: string, completed: boolean): Observable<TrainingStatus> {
    return this.auth.token$.pipe(
      take(1),
      switchMap((token) => {
        if (!token) {
          return throwError(() => new Error('Not authenticated'));
        }
        return this.http.post<TrainingStatus>(`${this.baseUrl}/complete/${encodeURIComponent(taskKey)}`, {
          completed
        });
      })
    );
  }
}




