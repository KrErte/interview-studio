import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/api/api-client.service';
import { ObserverLogDto } from './observer-log.model';

@Injectable({ providedIn: 'root' })
export class ObserverLogService {
  constructor(private api: ApiClient) {}

  getLogs(sessionUuid: string): Observable<ObserverLogDto[]> {
    return this.api.get<ObserverLogDto[]>('/observer-logs', {
      params: { sessionUuid }
    });
  }
}

