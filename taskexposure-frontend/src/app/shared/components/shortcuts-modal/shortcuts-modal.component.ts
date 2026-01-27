import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyboardShortcutsService } from '../../../core/services/keyboard-shortcuts.service';

@Component({
  selector: 'app-shortcuts-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shortcutsService.showHelpModal()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        (click)="close()"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70"></div>

        <!-- Modal -->
        <div
          class="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 class="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
            <button
              (click)="close()"
              class="text-gray-500 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="px-6 py-4 max-h-96 overflow-y-auto">
            <div class="space-y-3">
              @for (shortcut of shortcuts; track shortcut.key) {
                <div class="flex items-center justify-between">
                  <span class="text-gray-300">{{ shortcut.description }}</span>
                  <kbd class="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-400 font-mono">
                    {{ formatKey(shortcut.key) }}
                  </kbd>
                </div>
              }
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-800 bg-gray-800/50">
            <p class="text-gray-500 text-sm text-center">
              Press <kbd class="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    }
  `,
})
export class ShortcutsModalComponent {
  constructor(public shortcutsService: KeyboardShortcutsService) {}

  get shortcuts() {
    return this.shortcutsService.getVisibleShortcuts();
  }

  formatKey(key: string): string {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    if (key === 'k') {
      return isMac ? '⌘K' : 'Ctrl+K';
    }
    if (key === '?') {
      return '?';
    }
    if (key === '/') {
      return '/';
    }
    if (key === 'Escape') {
      return 'Esc';
    }
    return key.toUpperCase();
  }

  close(): void {
    this.shortcutsService.closeAllModals();
  }
}
