import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CandidateSummaryDto } from '../../core/models/interview-session.model';

@Injectable({ providedIn: 'root' })
export class CandidateSummaryStateService {
  private readonly summarySubject = new BehaviorSubject<CandidateSummaryDto | null>(null);
  readonly summary$: Observable<CandidateSummaryDto | null> = this.summarySubject.asObservable();

  setSummary(summary: CandidateSummaryDto | null | undefined): void {
    this.summarySubject.next(summary ?? null);
  }

  reset(): void {
    this.summarySubject.next(null);
  }
}


