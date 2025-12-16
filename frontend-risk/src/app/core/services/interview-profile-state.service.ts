import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { InterviewProfileDto } from '../models/interview-session.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewProfileStateService {
  private readonly profileSubject = new BehaviorSubject<InterviewProfileDto | null>(null);

  readonly profile$: Observable<InterviewProfileDto | null> = this.profileSubject.asObservable();

  setProfile(profile: InterviewProfileDto | null): void {
    this.profileSubject.next(profile);
  }

  reset(): void {
    this.profileSubject.next(null);
  }
}





