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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PaymentResult {
  success: boolean;
  email?: string;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss',
})
export class PaymentModalComponent {
  @Input() isOpen = false;
  @Input() price = '€9.99';
  @Input() productName = 'Premium Report';
  @Output() close = new EventEmitter<void>();
  @Output() paymentComplete = new EventEmitter<PaymentResult>();

  email = '';
  cardNumber = '';
  expiry = '';
  cvc = '';
  isProcessing = false;
  currentStep: 'form' | 'processing' | 'success' = 'form';

  get isFormValid(): boolean {
    return (
      this.email.includes('@') &&
      this.cardNumber.replace(/\s/g, '').length >= 15 &&
      this.expiry.length >= 4 &&
      this.cvc.length >= 3
    );
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('payment-modal__backdrop')) {
      this.onClose();
    }
  }

  onClose(): void {
    if (!this.isProcessing) {
      this.resetForm();
      this.close.emit();
    }
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const parts = value.match(/.{1,4}/g);
    input.value = parts ? parts.join(' ') : value;
    this.cardNumber = input.value;
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    input.value = value;
    this.expiry = input.value;
  }

  formatCvc(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    input.value = value;
    this.cvc = input.value;
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid || this.isProcessing) return;

    this.isProcessing = true;
    this.currentStep = 'processing';

    // Simulate payment processing
    await this.simulatePayment();

    this.currentStep = 'success';
    this.isProcessing = false;

    // Auto-close after success
    setTimeout(() => {
      this.paymentComplete.emit({ success: true, email: this.email });
      this.resetForm();
    }, 2000);
  }

  private simulatePayment(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }

  private resetForm(): void {
    this.email = '';
    this.cardNumber = '';
    this.expiry = '';
    this.cvc = '';
    this.currentStep = 'form';
    this.isProcessing = false;
  }
}
