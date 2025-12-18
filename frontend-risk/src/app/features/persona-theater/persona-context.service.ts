import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PersonaId } from './persona.model';

@Injectable({ providedIn: 'root' })
export class PersonaContext {
  private readonly personaSubject = new BehaviorSubject<PersonaId | null>(null);

  readonly persona$ = this.personaSubject.asObservable();

  get currentPersonaId(): PersonaId | null {
    return this.personaSubject.value;
  }

  setPersona(personaId: PersonaId): void {
    this.personaSubject.next(personaId);
  }

  resetPersona(): void {
    this.personaSubject.next(null);
  }
}

