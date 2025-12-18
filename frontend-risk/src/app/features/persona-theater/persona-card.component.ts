import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Persona } from './persona.model';

@Component({
  selector: 'app-persona-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="group w-full text-left transition-all"
      [class.opacity-90]="collapsed"
      [class.opacity-100]="!collapsed"
      (click)="handleSelect()"
      (keydown)="onKeydown($event)"
      role="radio"
      [attr.aria-checked]="active"
      [attr.aria-label]="persona.name"
      [tabindex]="0"
    >
      <div
        class="flex items-start gap-3 rounded-xl border px-3 py-3 shadow-sm transition-all"
        [ngClass]="{
          'border-emerald-500/70 bg-emerald-500/10 shadow-emerald-500/30': active,
          'border-slate-800 bg-slate-900/70 hover:border-emerald-400 hover:bg-slate-900': !active,
          'justify-center px-2 py-2': collapsed
        }"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-xl"
          [ngClass]="{ 'bg-emerald-500/20': active }"
        >
          {{ persona.emoji }}
        </div>

        <div class="min-w-0" *ngIf="!collapsed">
          <p class="text-sm font-semibold text-slate-50">{{ persona.name }}</p>
          <p class="text-xs text-slate-400 leading-snug">
            {{ persona.tagline[0] }}<br />
            {{ persona.tagline[1] }}
          </p>
        </div>
      </div>
    </button>
  `
})
export class PersonaCardComponent {
  @Input({ required: true }) persona!: Persona;
  @Input() active = false;
  @Input() collapsed = false;
  @Output() selectPersona = new EventEmitter<Persona>();

  handleSelect(): void {
    this.selectPersona.emit(this.persona);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.handleSelect();
    }
  }
}

