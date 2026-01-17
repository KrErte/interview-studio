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

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="toast"
      [ngClass]="'toast--' + toast.type"
      [class.toast--exiting]="isExiting"
      role="alert"
    >
      <div class="toast__icon">
        <svg *ngIf="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <svg *ngIf="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <svg *ngIf="toast.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <svg *ngIf="toast.type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <span class="toast__message">{{ toast.message }}</span>
      <button type="button" class="toast__close" (click)="onClose()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: toast-enter 0.3s ease-out;
      max-width: 400px;

      &--exiting {
        animation: toast-exit 0.2s ease-in forwards;
      }

      &--success {
        border-left: 4px solid var(--color-low-risk);
      }

      &--error {
        border-left: 4px solid var(--color-high-risk);
      }

      &--warning {
        border-left: 4px solid var(--color-medium-risk);
      }

      &--info {
        border-left: 4px solid var(--color-accent);
      }
    }

    @keyframes toast-enter {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes toast-exit {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }

    .toast__icon {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;

      svg {
        width: 100%;
        height: 100%;
      }

      .toast--success & {
        color: var(--color-low-risk);
      }

      .toast--error & {
        color: var(--color-high-risk);
      }

      .toast--warning & {
        color: var(--color-medium-risk);
      }

      .toast--info & {
        color: var(--color-accent);
      }
    }

    .toast__message {
      flex: 1;
      font-size: 0.9375rem;
      color: var(--color-text);
    }

    .toast__close {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-secondary);
      transition: color 0.2s ease;

      svg {
        width: 100%;
        height: 100%;
      }

      &:hover {
        color: var(--color-text);
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() toast!: Toast;
  @Output() dismiss = new EventEmitter<string>();

  isExiting = false;
  private timeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const duration = this.toast.duration ?? 5000;
    if (duration > 0) {
      this.timeout = setTimeout(() => this.startExit(), duration);
    }
  }

  ngOnDestroy(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  onClose(): void {
    this.startExit();
  }

  private startExit(): void {
    this.isExiting = true;
    setTimeout(() => {
      this.dismiss.emit(this.toast.id);
    }, 200);
  }
}
