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

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface KpiItem {
  label: string;
  value: string | number;
  color?: 'accent' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'low' | 'medium' | 'high';
  icon?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

@Component({
  selector: 'app-kpi-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-grid.component.html',
  styleUrl: './kpi-grid.component.scss',
})
export class KpiGridComponent {
  @Input() items: KpiItem[] = [];
  @Input() columns: 2 | 3 | 4 | 6 = 3;
}
