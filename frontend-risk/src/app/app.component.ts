import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommandPaletteComponent } from './shared/command-palette/command-palette.component';
import { KeyboardShortcutsComponent } from './shared/keyboard-shortcuts/keyboard-shortcuts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommandPaletteComponent, KeyboardShortcutsComponent],
  template: `
    <router-outlet></router-outlet>
    <app-command-palette />
    <app-keyboard-shortcuts />
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
