/*
 * Copyright 2025 TASKEXPOSURE
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ToastComponent, Toast } from '../toast/toast.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, AsyncPipe, ToastComponent],
  template: `
    <div class="toast-container">
      <app-toast
        *ngFor="let toast of (toastService.toasts$ | async); trackBy: trackByToast"
        [toast]="toast"
        (dismiss)="toastService.dismiss($event)"
      ></app-toast>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 100%;
      padding: 0 1rem;

      @media (min-width: 640px) {
        padding: 0;
      }
    }
  `]
})
export class ToastContainerComponent {
  protected toastService = inject(ToastService);

  trackByToast(index: number, toast: Toast): string {
    return toast.id;
  }
}
