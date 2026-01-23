import { Injectable, signal, computed, effect } from '@angular/core';

/**
 * UI Mode types
 * - 'simple': Simplified interface for casual users
 * - 'advanced': Full-featured interface for power users
 */
export type UiMode = 'simple' | 'advanced';

const STORAGE_KEY = 'workforceIntel.uiMode';
const DEFAULT_MODE: UiMode = 'simple';

/**
 * Service for managing UI mode state (Simple vs Advanced).
 * Persists the mode to localStorage under 'workforceIntel.uiMode'.
 * Defaults to 'simple' when no stored value exists.
 */
@Injectable({ providedIn: 'root' })
export class UiModeService {
  /** Reactive signal holding the current UI mode */
  private readonly _mode = signal<UiMode>(this.loadFromStorage());

  /** Read-only signal for the current UI mode */
  readonly mode = this._mode.asReadonly();

  /** Computed signal: true if mode is 'simple' */
  readonly isSimple = computed(() => this._mode() === 'simple');

  /** Computed signal: true if mode is 'advanced' */
  readonly isAdvanced = computed(() => this._mode() === 'advanced');

  constructor() {
    // Persist to localStorage whenever mode changes
    effect(() => {
      const currentMode = this._mode();
      this.saveToStorage(currentMode);
    });
  }

  /**
   * Get the current UI mode value
   */
  getMode(): UiMode {
    return this._mode();
  }

  /**
   * Set the UI mode
   */
  setMode(mode: UiMode): void {
    if (mode !== 'simple' && mode !== 'advanced') {
      console.warn(`Invalid UI mode: ${mode}. Defaulting to '${DEFAULT_MODE}'.`);
      mode = DEFAULT_MODE;
    }
    this._mode.set(mode);
  }

  /**
   * Toggle between simple and advanced modes
   */
  toggle(): void {
    const newMode: UiMode = this._mode() === 'simple' ? 'advanced' : 'simple';
    this._mode.set(newMode);
  }

  /**
   * Reset to the default mode (simple)
   */
  reset(): void {
    this._mode.set(DEFAULT_MODE);
  }

  /**
   * Load mode from localStorage, falling back to default
   */
  private loadFromStorage(): UiMode {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'simple' || stored === 'advanced') {
        return stored;
      }
    } catch (e) {
      // localStorage may not be available (e.g., SSR, private browsing)
      console.warn('Could not read UI mode from localStorage:', e);
    }
    return DEFAULT_MODE;
  }

  /**
   * Save mode to localStorage
   */
  private saveToStorage(mode: UiMode): void {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.warn('Could not save UI mode to localStorage:', e);
    }
  }
}
