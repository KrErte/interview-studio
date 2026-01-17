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
import { ExposureBand } from '../../shared/content/copy';
import { AnimatedGaugeComponent } from '../../shared/components/animated-gauge/animated-gauge.component';
import { UpgradeCtaComponent } from '../../shared/components/upgrade-cta/upgrade-cta.component';
import { PremiumService } from '../../core/services/premium.service';
import { CopyService } from '../../core/services/copy.service';

/**
 * 3.5 Score Screen - "The Mirror Moment"
 *
 * PURPOSE: Deliver the exposure score with emotional intelligence.
 * Frame numbers as starting points, not verdicts.
 *
 * Uses four exposure bands with emotional framing:
 * - Protected (<30%): Strong human moats
 * - Mixed (30-50%): Mix of automatable and human-exclusive
 * - Exposed (50-70%): Significant AI overlap, but not a crisis
 * - Critical (>70%): Requires active attention, not panic
 */
@Component({
  selector: 'app-risk-score',
  standalone: true,
  imports: [CommonModule, AnimatedGaugeComponent, UpgradeCtaComponent],
  templateUrl: './risk-score.component.html',
  styleUrl: './risk-score.component.scss',
})
export class RiskScoreComponent {
  readonly premium = inject(PremiumService);
  private copyService = inject(CopyService);

  @Input() score: number = 0;
  @Output() continue = new EventEmitter<void>();
  @Output() upgrade = new EventEmitter<void>();

  get copy() {
    return this.copyService.riskScoreCopy;
  }
  showContext: boolean = false;

  get exposureBand(): ExposureBand {
    return this.copyService.getExposureBand(this.score);
  }

  get scoreColorClass(): string {
    const band = this.exposureBand;
    const colorMap: Record<ExposureBand, string> = {
      protected: 'risk-score__percentage--protected',
      mixed: 'risk-score__percentage--mixed',
      exposed: 'risk-score__percentage--exposed',
      critical: 'risk-score__percentage--critical',
    };
    return colorMap[band];
  }

  get bandColorClass(): string {
    return `risk-score__band--${this.exposureBand}`;
  }

  get scoreMeaning(): { label: string; meaning: string; action: string } {
    return this.copyService.getScoreMeaning(this.score);
  }

  /**
   * Calculate potential reduced score (40-55% reduction based on actions)
   * This creates agency - showing what's possible with targeted changes
   */
  get potentialReducedScore(): number {
    // Use a deterministic calculation based on score to avoid random changes
    const reductionFactor = 0.45 + (this.score % 10) / 100;
    const reduced = Math.round(this.score * (1 - reductionFactor));
    return Math.max(reduced, 12); // Minimum 12% (never promise 0)
  }

  /**
   * Number of changes needed (correlates with current score)
   */
  get changesNeeded(): number {
    if (this.score >= 70) return 5;
    if (this.score >= 50) return 4;
    if (this.score >= 30) return 3;
    return 2;
  }

  onAnimationComplete(): void {
    this.showContext = true;
  }

  onContinue(): void {
    this.continue.emit();
  }

  onUpgrade(): void {
    this.upgrade.emit();
  }
}
