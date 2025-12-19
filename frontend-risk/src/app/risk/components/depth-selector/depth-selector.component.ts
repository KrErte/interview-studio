import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { DepthPreferenceService } from '../../services/depth-preference.service';
import { AssessmentDepth, PersonaType } from '../../models/depth.model';
import { DEPTH_LABELS } from '../../i18n/depth-labels';

@Component({
  selector: 'app-depth-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depth-selector.component.html'
})
export class DepthSelectorComponent {
  private depthService = inject(DepthPreferenceService);

  readonly AssessmentDepth = AssessmentDepth;
  readonly PersonaType = PersonaType;
  readonly labels = DEPTH_LABELS.et; // Could be wired to i18n service later

  readonly selectedDepth = this.depthService.depth;
  readonly selectedPersona = this.depthService.persona;

  advancedExpanded = signal(false);
  readonly personas = Object.values(PersonaType);

  selectDepth(depth: AssessmentDepth): void {
    this.depthService.setDepth(depth);
    if (depth === AssessmentDepth.QUICK) {
      this.advancedExpanded.set(false);
    }
  }

  selectPersona(persona: PersonaType): void {
    this.depthService.setPersona(persona);
  }

  toggleAdvanced(): void {
    if (this.selectedDepth() === AssessmentDepth.DEEP || this.advancedExpanded()) {
      this.advancedExpanded.update((v) => !v);
    }
  }

  isAdvancedDisabled(): boolean {
    return this.selectedDepth() === AssessmentDepth.QUICK;
  }

  getCardClasses(depth: AssessmentDepth): string {
    const base = 'relative p-4 rounded-xl border-2 transition-all duration-200 text-left';
    const selected = this.selectedDepth() === depth;
    if (selected) {
      return `${base} border-emerald-500 bg-emerald-900/20`;
    }
    return `${base} border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800`;
  }

  getPersonaClasses(persona: PersonaType): string {
    const base = 'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200';
    const selected = this.selectedPersona() === persona;
    if (selected) {
      return `${base} border-emerald-500 bg-emerald-900/30`;
    }
    return `${base} border-gray-700 bg-gray-800/30 hover:border-gray-600`;
  }

  getPersonaIcon(persona: PersonaType): string {
    const icons: Record<PersonaType, string> = {
      [PersonaType.BALANCED]: '☯️',
      [PersonaType.NAVIGATOR]: '🧭',
      [PersonaType.ANALYST]: '📊',
      [PersonaType.ENGINEER]: '🛠️',
      [PersonaType.EVALUATOR]: '✓',
      [PersonaType.RISK_OFFICER]: '🛡️',
      [PersonaType.COACH]: '💬'
    };
    return icons[persona];
  }
}

