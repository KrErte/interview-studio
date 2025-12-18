import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Persona, PersonaId } from './persona.model';
import { PersonaContext } from './persona-context.service';
import { PersonaCardComponent } from './persona-card.component';

@Component({
  selector: 'app-persona-theater',
  standalone: true,
  imports: [CommonModule, PersonaCardComponent],
  template: `
    <aside
      class="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 shadow-xl shadow-emerald-500/10 backdrop-blur"
      [class.w-20]="collapsed"
      [class.w-full]="!collapsed"
      aria-label="Persona theater"
    >
      <div class="mb-3 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-emerald-300">Personas</span>
          <span class="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">P1–P7</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-800 px-2 py-1 text-[11px] text-slate-300 transition hover:border-emerald-400 hover:text-emerald-200"
            (click)="resetView()"
            [disabled]="!activePersonaId"
            [class.opacity-60]="!activePersonaId"
          >
            Reset View
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-800 px-2 py-1 text-[11px] text-slate-300 transition hover:border-emerald-400 hover:text-emerald-200"
            (click)="toggleCollapse()"
            [attr.aria-pressed]="collapsed"
          >
            {{ collapsed ? 'Expand' : 'Collapse' }}
          </button>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="Select persona perspective"
        class="space-y-3"
        (keydown)="onContainerKeydown($event)"
      >
        <app-persona-card
          *ngFor="let persona of personas; trackBy: trackById"
          [persona]="persona"
          [active]="persona.id === activePersonaId"
          [collapsed]="collapsed"
          (selectPersona)="onSelectPersona($event)"
        ></app-persona-card>
      </div>
    </aside>
  `
})
export class PersonaTheaterContainerComponent {
  @Output() personaChanged = new EventEmitter<Persona | null>();

  personas: Persona[] = [
    { id: 'P1', emoji: '🧭', name: 'Navigator', tagline: ['Signals bias', 'Systems-first lens'] },
    { id: 'P2', emoji: '🧠', name: 'Analyst', tagline: ['Data-grounded', 'Risk deltas by step'] },
    { id: 'P3', emoji: '🧑‍💻', name: 'Engineer', tagline: ['Implementation path', 'Tech debt heatmap'] },
    { id: 'P4', emoji: '🎯', name: 'Evaluator', tagline: ['Objective scoring', 'Confidence guardrails'] },
    { id: 'P5', emoji: '🛡️', name: 'Risk Officer', tagline: ['Failure modes', 'Controls & mitigations'] },
    { id: 'P6', emoji: '🗣️', name: 'Coach', tagline: ['Narrative clarity', 'Human feedback focus'] },
    { id: 'P7', emoji: '⚖️', name: 'Balanced', tagline: ['Neutral overview', 'No persona bias'] }
  ];

  collapsed = false;

  constructor(private personaContext: PersonaContext) {}

  get activePersonaId(): PersonaId | null {
    return this.personaContext.currentPersonaId;
  }

  trackById(_: number, persona: Persona): PersonaId {
    return persona.id;
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  onSelectPersona(persona: Persona): void {
    if (this.activePersonaId === persona.id) {
      this.resetView();
      return;
    }
    this.personaContext.setPersona(persona.id);
    this.personaChanged.emit(persona);
  }

  resetView(): void {
    this.personaContext.resetPersona();
    this.personaChanged.emit(null);
  }

  onContainerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.resetView();
    }
  }
}

