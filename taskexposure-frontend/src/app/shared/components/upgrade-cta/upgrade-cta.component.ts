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

export interface UpgradeFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-upgrade-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upgrade-cta.component.html',
  styleUrl: './upgrade-cta.component.scss',
})
export class UpgradeCtaComponent {
  @Input() variant: 'inline' | 'full' = 'inline';
  @Input() showFeatures = true;
  @Output() upgrade = new EventEmitter<void>();
  @Output() continueFree = new EventEmitter<void>();

  readonly price = '€9.99';

  readonly features: UpgradeFeature[] = [
    {
      icon: 'chart',
      title: 'Task-by-Task Analysis',
      description: 'See exactly which tasks are most at risk',
    },
    {
      icon: 'map',
      title: 'Your Action Plan',
      description: 'Specific steps to reduce your exposure',
    },
    {
      icon: 'brain',
      title: 'AI Capability Radar',
      description: 'Understand where AI overlaps with your work',
    },
    {
      icon: 'download',
      title: 'PDF Report',
      description: 'Save and share your analysis',
    },
  ];

  readonly freeFeatures = [
    'Overall exposure score',
    'Basic AI capability match',
  ];

  readonly premiumFeatures = [
    'Task-by-task breakdown',
    'AI capability radar chart',
    'Personalized action plan',
    'Detailed reasoning for each task',
    'PDF export',
  ];

  onUpgrade(): void {
    this.upgrade.emit();
  }

  onContinueFree(): void {
    this.continueFree.emit();
  }
}
