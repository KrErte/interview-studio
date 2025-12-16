import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-6">
      <h1 class="text-3xl font-bold mb-2">404</h1>
      <p class="text-slate-400 mb-4">Page not found</p>
      <a routerLink="/" class="text-emerald-300 hover:text-emerald-200 text-sm">Go home</a>
    </div>
  `
})
export class NotFoundComponent {}


