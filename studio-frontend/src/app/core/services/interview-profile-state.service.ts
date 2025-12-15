import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { InterviewProfileDto } from '../models/interview-session.model';

/**
 * Shared, read-only state for the current CV-derived interview profile.
 * - Candidate view: "Interview Focus Preview" on the studio page.
 * - Interviewer view: CV-driven context inside the Control Room drawer.
 */
@Injectable({
  providedIn: 'root'
})
export class InterviewProfileStateService {
  private readonly profileSubject = new BehaviorSubject<InterviewProfileDto | null>(
    null
  );

  readonly profile$: Observable<InterviewProfileDto | null> =
    this.profileSubject.asObservable();

  setProfile(profile: InterviewProfileDto | null): void {
    this.profileSubject.next(profile);
  }

  reset(): void {
    this.profileSubject.next(null);
  }
}



