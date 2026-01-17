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

import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyService } from '../../core/services/copy.service';

/**
 * 3.1 Start Screen - "The Mirror"
 *
 * PURPOSE: Establish credibility, differentiate from fear-based tools,
 * invite self-reflection rather than passive consumption.
 *
 * EMOTIONAL STATE: Curious but guarded. User expects another doomsday calculator.
 */
@Component({
  selector: 'app-entry',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.scss',
})
export class EntryComponent {
  private copyService = inject(CopyService);
  @Output() begin = new EventEmitter<void>();

  get copy() {
    return this.copyService.entryCopy;
  }

  // Colors for the differentiator feature cards
  readonly featureColors = ['accent', 'purple', 'emerald'];

  onBegin(): void {
    this.begin.emit();
  }
}
