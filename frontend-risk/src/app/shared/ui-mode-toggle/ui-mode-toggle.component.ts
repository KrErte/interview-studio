import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiModeService } from '../../core/services/ui-mode.service';

/**
 * UI Mode Toggle Component
 *
 * A compact toggle switch for switching between Simple and Advanced UI modes.
 * Designed for placement in the header (top-right).
 *
 * @example
 * <app-ui-mode-toggle />
 */
@Component({
  selector: 'app-ui-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <!-- Mode label -->
      <span class="text-xs text-slate-400 hidden sm:inline">
        {{ uiMode.isSimple() ? 'Simple' : 'Advanced' }}
      </span>

      <!-- Toggle switch -->
      <button
        type="button"
        (click)="uiMode.toggle()"
        [attr.aria-pressed]="uiMode.isAdvanced()"
        aria-label="Toggle UI mode between Simple and Advanced"
        class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        [ngClass]="{
          'bg-emerald-500': uiMode.isAdvanced(),
          'bg-slate-600': uiMode.isSimple()
        }"
      >
        <span class="sr-only">Toggle UI mode</span>

        <!-- Toggle knob -->
        <span
          class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          [ngClass]="{
            'translate-x-5': uiMode.isAdvanced(),
            'translate-x-0': uiMode.isSimple()
          }"
        >
          <!-- Simple mode icon (lightning bolt - quick/simple) -->
          <span
            class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
            [ngClass]="{
              'opacity-0 duration-100 ease-out': uiMode.isAdvanced(),
              'opacity-100 duration-200 ease-in': uiMode.isSimple()
            }"
          >
            <svg class="h-3 w-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
            </svg>
          </span>

          <!-- Advanced mode icon (cog - detailed/settings) -->
          <span
            class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
            [ngClass]="{
              'opacity-100 duration-200 ease-in': uiMode.isAdvanced(),
              'opacity-0 duration-100 ease-out': uiMode.isSimple()
            }"
          >
            <svg class="h-3 w-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
          </span>
        </span>
      </button>

      <!-- Optional tooltip/hint on hover -->
      <div class="relative group">
        <button
          type="button"
          class="text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="UI mode info"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <div class="absolute right-0 top-full mt-2 w-48 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-slate-300">
          <p class="font-medium text-slate-200 mb-1">UI Mode</p>
          <p><span class="text-emerald-400">Simple:</span> Streamlined interface</p>
          <p><span class="text-cyan-400">Advanced:</span> Full features</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UiModeToggleComponent {
  readonly uiMode = inject(UiModeService);
}
