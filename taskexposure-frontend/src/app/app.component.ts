import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShortcutsModalComponent } from './shared/components/shortcuts-modal/shortcuts-modal.component';
import { CommandPaletteComponent } from './shared/components/command-palette/command-palette.component';
import { KeyboardShortcutsService } from './core/services/keyboard-shortcuts.service';

/**
 * Interview Studio V2 root component.
 * Includes router outlet plus global shortcuts modal and command palette.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ShortcutsModalComponent, CommandPaletteComponent],
  template: `
    <router-outlet />
    <app-shortcuts-modal />
    <app-command-palette />
  `,
})
export class AppComponent implements OnInit {
  // Inject to initialize keyboard listener on app start
  constructor(private shortcutsService: KeyboardShortcutsService) {}

  ngOnInit(): void {
    // Keyboard shortcuts service initializes itself on construction
  }
}
