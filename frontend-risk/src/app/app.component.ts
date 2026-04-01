import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommandPaletteComponent } from './shared/command-palette/command-palette.component';
import { KeyboardShortcutsComponent } from './shared/keyboard-shortcuts/keyboard-shortcuts.component';
import { SeoService } from './core/services/seo.service';

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
export class AppComponent implements OnInit {
  private router = inject(Router);
  private seo = inject(SeoService);

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      const data = this.getRouteData();
      this.seo.updateMeta({
        title: data['title'],
        description: data['description'],
        url: 'https://careerrisk.ee' + this.router.url.split('?')[0]
      });
    });
  }

  private getRouteData(): Record<string, string> {
    let route = this.router.routerState.root;
    let data: Record<string, string> = {};
    while (route.firstChild) {
      route = route.firstChild;
      if (route.snapshot.data) {
        data = { ...data, ...route.snapshot.data };
      }
    }
    return data;
  }
}
