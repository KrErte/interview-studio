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

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalStrength } from '../../shared/models/signal-strength.model';
import { CopyService } from '../../core/services/copy.service';

@Component({
  selector: 'app-assessment-justification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-justification.component.html',
  styleUrl: './assessment-justification.component.scss',
})
export class AssessmentJustificationComponent {
  private copyService = inject(CopyService);

  @Input() aiCapabilities: string[] = [];
  @Input() aiLimitations: string[] = [];
  @Input() signalStrength: SignalStrength = 'moderate';
  @Output() continue = new EventEmitter<void>();

  get copy() {
    return this.copyService.assessmentJustificationCopy;
  }

  isSignalInfoExpanded = false;

  get signalStrengthExplanation(): string {
    return this.copyService.getSignalStrengthExplanation(this.signalStrength);
  }

  toggleSignalInfo(): void {
    this.isSignalInfoExpanded = !this.isSignalInfoExpanded;
  }

  onContinue(): void {
    this.continue.emit();
  }
}
