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

import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-market-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-market-landing.component.html',
  styleUrl: './job-market-landing.component.scss',
})
export class JobMarketLandingComponent {
  @Output() start = new EventEmitter<void>();

  readonly promise = 'Are you competitive in the job market right now?';
  readonly subtitle = 'Find out in 15 minutes - and get a clear action plan for the next 30 days.';

  readonly bullets = [
    'Honest assessment of where you stand (Red, Yellow, or Green)',
    'Your top 3 blockers - the real reasons you\'re not getting offers',
    'A 30-day action plan with specific weekly steps',
  ];

  onStart(): void {
    this.start.emit();
  }
}
