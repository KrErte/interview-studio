import { Component, signal, computed, OnInit, OnDestroy, ElementRef, ViewChild, effect, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { KeyboardShortcutsService } from '../../../core/services/keyboard-shortcuts.service';
import { AuthService } from '../../../core/services/auth.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: string;
  action: () => void;
  requiresAuth?: boolean;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (shortcutsService.showCommandPalette()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
        (click)="close()"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70"></div>

        <!-- Palette -->
        <div
          class="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <!-- Search input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              #searchInput
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Type a command or search..."
              class="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              (keydown.arrowdown)="selectNext($event)"
              (keydown.arrowup)="selectPrev($event)"
              (keydown.enter)="executeSelected()"
            />
            <kbd class="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-gray-500">
              Esc
            </kbd>
          </div>

          <!-- Results -->
          <div class="max-h-80 overflow-y-auto py-2">
            @if (filteredCommands().length === 0) {
              <div class="px-4 py-8 text-center text-gray-500">
                No commands found
              </div>
            } @else {
              @for (command of filteredCommands(); track command.id; let i = $index) {
                <button
                  (click)="execute(command)"
                  (mouseenter)="selectedIndex.set(i)"
                  class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  [class.bg-gray-800]="selectedIndex() === i"
                >
                  <span class="text-xl" [innerHTML]="command.icon"></span>
                  <div class="flex-1">
                    <div class="text-white font-medium">{{ command.label }}</div>
                    @if (command.description) {
                      <div class="text-gray-500 text-sm">{{ command.description }}</div>
                    }
                  </div>
                  @if (selectedIndex() === i) {
                    <kbd class="px-1.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs text-gray-400">
                      ↵
                    </kbd>
                  }
                </button>
              }
            }
          </div>

          <!-- Footer -->
          <div class="px-4 py-2 border-t border-gray-800 bg-gray-800/50 flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center gap-4">
              <span><kbd class="px-1 bg-gray-700 rounded">↑↓</kbd> Navigate</span>
              <span><kbd class="px-1 bg-gray-700 rounded">↵</kbd> Select</span>
            </div>
            <span><kbd class="px-1 bg-gray-700 rounded">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    }
  `,
})
export class CommandPaletteComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery = '';
  selectedIndex = signal(0);

  private commands: Command[] = [];
  private wasPaletteOpen = false;

  constructor(
    public shortcutsService: KeyboardShortcutsService,
    private router: Router,
    private authService: AuthService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.initCommands();
  }

  ngOnDestroy(): void {}

  ngAfterViewChecked(): void {
    // Focus input when palette opens
    const isOpen = this.shortcutsService.showCommandPalette();
    if (isOpen && !this.wasPaletteOpen && this.searchInput?.nativeElement) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 0);
    }
    this.wasPaletteOpen = isOpen;
  }

  private initCommands(): void {
    this.commands = [
      {
        id: 'new-session',
        label: 'New Session',
        description: 'Start a new quick assessment',
        icon: '⚡',
        action: () => this.router.navigate(['/session/new']),
      },
      {
        id: 'new-advanced',
        label: 'New Advanced Session',
        description: 'Start a detailed assessment',
        icon: '📋',
        action: () => {
          if (this.authService.isAuthenticated()) {
            this.router.navigate(['/session/new/advanced']);
          } else {
            this.router.navigate(['/login'], { queryParams: { returnUrl: '/session/new/advanced' } });
          }
        },
      },
      {
        id: 'history',
        label: 'View History',
        description: 'See your past sessions',
        icon: '📁',
        action: () => this.router.navigate(['/history']),
        requiresAuth: true,
      },
      {
        id: 'pricing',
        label: 'View Pricing',
        description: 'See pricing details',
        icon: '💰',
        action: () => this.router.navigate(['/pricing']),
      },
      {
        id: 'home',
        label: 'Go Home',
        description: 'Return to landing page',
        icon: '🏠',
        action: () => this.router.navigate(['/']),
      },
      {
        id: 'shortcuts',
        label: 'Keyboard Shortcuts',
        description: 'View all shortcuts',
        icon: '⌨️',
        action: () => {
          this.close();
          setTimeout(() => this.shortcutsService.toggleHelpModal(), 100);
        },
      },
    ];

    // Add auth commands
    if (this.authService.isAuthenticated()) {
      this.commands.push({
        id: 'logout',
        label: 'Sign Out',
        description: 'Log out of your account',
        icon: '👋',
        action: () => this.authService.logout(),
      });
    } else {
      this.commands.push(
        {
          id: 'login',
          label: 'Sign In',
          description: 'Log into your account',
          icon: '🔑',
          action: () => this.router.navigate(['/login']),
        },
        {
          id: 'register',
          label: 'Create Account',
          description: 'Sign up for an account',
          icon: '✨',
          action: () => this.router.navigate(['/register']),
        }
      );
    }
  }

  filteredCommands = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      return this.getVisibleCommands();
    }

    return this.getVisibleCommands().filter(cmd =>
      cmd.label.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query)
    );
  });

  private getVisibleCommands(): Command[] {
    const isAuth = this.authService.isAuthenticated();
    return this.commands.filter(cmd => !cmd.requiresAuth || isAuth);
  }

  selectNext(event: Event): void {
    event.preventDefault();
    const max = this.filteredCommands().length - 1;
    this.selectedIndex.update(i => Math.min(i + 1, max));
  }

  selectPrev(event: Event): void {
    event.preventDefault();
    this.selectedIndex.update(i => Math.max(i - 1, 0));
  }

  executeSelected(): void {
    const commands = this.filteredCommands();
    const selected = commands[this.selectedIndex()];
    if (selected) {
      this.execute(selected);
    }
  }

  execute(command: Command): void {
    this.analytics.track('command_palette_opened', { command: command.id });
    this.close();
    command.action();
  }

  close(): void {
    this.searchQuery = '';
    this.selectedIndex.set(0);
    this.shortcutsService.closeAllModals();
  }
}
