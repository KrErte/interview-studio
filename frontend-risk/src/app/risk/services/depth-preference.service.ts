import { Injectable, computed, signal } from '@angular/core';
import { AssessmentDepth, PersonaType, DepthPreference, DEPTH_CONFIGS } from '../models/depth.model';

@Injectable({ providedIn: 'root' })
export class DepthPreferenceService {
  private readonly STORAGE_KEY = 'futureproof.depthPreference';

  private preferenceSignal = signal<DepthPreference>(this.loadFromStorage());

  readonly preference = this.preferenceSignal.asReadonly();
  readonly depth = computed(() => this.preferenceSignal().depth);
  readonly persona = computed(() => this.preferenceSignal().persona);
  readonly config = computed(() => DEPTH_CONFIGS[this.depth()]);

  private loadFromStorage(): DepthPreference {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load depth preference', e);
    }
    return this.getDefault();
  }

  private getDefault(): DepthPreference {
    return {
      depth: AssessmentDepth.QUICK,
      persona: PersonaType.BALANCED,
      lastUpdated: new Date().toISOString()
    };
  }

  setDepth(depth: AssessmentDepth): void {
    const current = this.preferenceSignal();
    const persona = depth === AssessmentDepth.QUICK ? PersonaType.BALANCED : current.persona;
    this.updatePreference({ depth, persona });
  }

  setPersona(persona: PersonaType): void {
    if (this.depth() === AssessmentDepth.DEEP) {
      this.updatePreference({ persona });
    }
  }

  private updatePreference(partial: Partial<DepthPreference>): void {
    const updated: DepthPreference = {
      ...this.preferenceSignal(),
      ...partial,
      lastUpdated: new Date().toISOString()
    };
    this.preferenceSignal.set(updated);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.preferenceSignal.set(this.getDefault());
  }
}

