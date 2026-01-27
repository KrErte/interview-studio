import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  requiresAuth?: boolean;
  global?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutsService {
  private readonly shortcuts: Map<string, Shortcut> = new Map();

  readonly showHelpModal = signal(false);
  readonly showCommandPalette = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.registerDefaultShortcuts();
    this.setupKeyboardListener();
  }

  private registerDefaultShortcuts(): void {
    // Help modal
    this.register({
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => this.toggleHelpModal(),
      global: true,
    });

    // Command palette
    this.register({
      key: '/',
      description: 'Open command palette',
      action: () => this.openCommandPalette(),
      global: true,
    });

    this.register({
      key: 'k',
      description: 'Open command palette (Cmd/Ctrl+K)',
      action: () => this.openCommandPalette(),
      global: true,
    });

    // Close modals
    this.register({
      key: 'Escape',
      description: 'Close modal',
      action: () => this.closeAllModals(),
      global: true,
    });

    // Navigation
    this.register({
      key: 'n',
      description: 'New session',
      action: () => this.router.navigate(['/session/new']),
    });

    this.register({
      key: 'h',
      description: 'Go to history',
      action: () => this.router.navigate(['/history']),
      requiresAuth: true,
    });

    this.register({
      key: 'p',
      description: 'Go to pricing',
      action: () => this.router.navigate(['/pricing']),
    });

    this.register({
      key: 'g',
      description: 'Go home',
      action: () => this.router.navigate(['/']),
    });
  }

  register(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.key.toLowerCase(), shortcut);
  }

  getShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  getVisibleShortcuts(): Shortcut[] {
    const isAuth = this.authService.isAuthenticated();
    return this.getShortcuts().filter(s => !s.requiresAuth || isAuth);
  }

  toggleHelpModal(): void {
    this.showHelpModal.update(v => !v);
    if (this.showHelpModal()) {
      this.showCommandPalette.set(false);
    }
  }

  openCommandPalette(): void {
    this.showCommandPalette.set(true);
    this.showHelpModal.set(false);
  }

  closeAllModals(): void {
    this.showHelpModal.set(false);
    this.showCommandPalette.set(false);
  }

  private setupKeyboardListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      // Don't trigger in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Allow Escape in input fields
        if (event.key !== 'Escape') {
          return;
        }
      }

      // Handle Cmd/Ctrl+K
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        this.openCommandPalette();
        return;
      }

      // Handle ? (Shift+/)
      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        this.toggleHelpModal();
        return;
      }

      // Handle other shortcuts
      const key = event.key.toLowerCase();
      const shortcut = this.shortcuts.get(key);

      if (shortcut) {
        // Check auth requirement
        if (shortcut.requiresAuth && !this.authService.isAuthenticated()) {
          return;
        }

        // Don't trigger navigation shortcuts if modal is open
        if (!shortcut.global && (this.showHelpModal() || this.showCommandPalette())) {
          return;
        }

        event.preventDefault();
        shortcut.action();
      }
    });
  }
}
