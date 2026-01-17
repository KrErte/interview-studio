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

import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-gauge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-gauge.component.html',
  styleUrl: './animated-gauge.component.scss',
})
export class AnimatedGaugeComponent implements OnInit, OnChanges {
  @Input() targetScore: number = 0;
  @Input() animationDuration: number = 2000;
  @Output() animationComplete = new EventEmitter<void>();

  @ViewChild('gaugeCircle') gaugeCircle!: ElementRef<SVGCircleElement>;

  displayScore: number = 0;
  isAnimating: boolean = false;
  animationDone: boolean = false;

  // SVG gauge properties
  readonly radius: number = 90;
  readonly strokeWidth: number = 12;
  readonly circumference: number = 2 * Math.PI * this.radius;

  get strokeDashoffset(): number {
    const progress = this.displayScore / 100;
    return this.circumference * (1 - progress);
  }

  get scoreColorClass(): string {
    if (this.displayScore <= 33) return 'low';
    if (this.displayScore <= 66) return 'medium';
    return 'high';
  }

  get gaugeColorClass(): string {
    return `gauge--${this.scoreColorClass}`;
  }

  ngOnInit(): void {
    this.startAnimation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['targetScore'] && !changes['targetScore'].firstChange) {
      this.startAnimation();
    }
  }

  private startAnimation(): void {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.animationDone = false;
    this.displayScore = 0;

    const startTime = performance.now();
    const startScore = 0;
    const endScore = this.targetScore;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.animationDuration, 1);

      // Easing function: easeOutExpo for dramatic reveal
      const easeProgress = 1 - Math.pow(1 - progress, 4);

      this.displayScore = Math.round(startScore + (endScore - startScore) * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.displayScore = endScore;
        this.isAnimating = false;
        this.animationDone = true;
        this.animationComplete.emit();
      }
    };

    requestAnimationFrame(animate);
  }
}
