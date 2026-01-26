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
import { JobMarketService } from '../../core/services/job-market.service';
import { JobMarketFreeResult, JobMarketStatus } from '../../shared/models/job-market.model';

@Component({
  selector: 'app-job-market-result-free',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-market-result-free.component.html',
  styleUrl: './job-market-result-free.component.scss',
})
export class JobMarketResultFreeComponent {
  private jobMarketService = inject(JobMarketService);

  @Output() getPlan = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  get result(): JobMarketFreeResult | undefined {
    return this.jobMarketService.state.freeResult;
  }

  get statusLabel(): string {
    if (!this.result) return '';
    const labels: Record<JobMarketStatus, string> = {
      red: 'Red',
      yellow: 'Yellow',
      green: 'Green',
    };
    return labels[this.result.status];
  }

  get statusDescription(): string {
    if (!this.result) return '';
    const descriptions: Record<JobMarketStatus, string> = {
      red: 'Action needed before applying',
      yellow: 'Adjustments required',
      green: 'Ready to move forward',
    };
    return descriptions[this.result.status];
  }

  onGetPlan(): void {
    this.getPlan.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
