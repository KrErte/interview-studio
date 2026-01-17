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

import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RadarDataPoint {
  label: string;
  value: number; // 0-100
  color?: string;
}

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radar-chart.component.html',
  styleUrl: './radar-chart.component.scss',
})
export class RadarChartComponent implements OnInit, OnChanges {
  @Input() data: RadarDataPoint[] = [];
  @Input() size: number = 250;

  readonly centerX = 125;
  readonly centerY = 125;
  readonly maxRadius = 100;
  readonly levels = 4;

  polygonPoints: string = '';
  labelPositions: Array<{ x: number; y: number; label: string; value: number }> = [];
  gridLines: string[] = [];
  dataPoints: Array<{ cx: number; cy: number }> = [];

  ngOnInit(): void {
    this.calculateChart();
  }

  ngOnChanges(): void {
    this.calculateChart();
  }

  private calculateChart(): void {
    if (this.data.length < 3) return;

    const angleStep = (2 * Math.PI) / this.data.length;
    const startAngle = -Math.PI / 2; // Start from top

    // Calculate polygon points
    const points: string[] = [];
    this.labelPositions = [];
    this.dataPoints = [];

    this.data.forEach((point, i) => {
      const angle = startAngle + i * angleStep;
      const radius = (point.value / 100) * this.maxRadius;
      const x = this.centerX + radius * Math.cos(angle);
      const y = this.centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);

      // Store data point positions for circles
      this.dataPoints.push({ cx: x, cy: y });

      // Label positions (slightly outside the chart)
      const labelRadius = this.maxRadius + 20;
      const labelX = this.centerX + labelRadius * Math.cos(angle);
      const labelY = this.centerY + labelRadius * Math.sin(angle);
      this.labelPositions.push({
        x: labelX,
        y: labelY,
        label: point.label,
        value: point.value,
      });
    });

    this.polygonPoints = points.join(' ');

    // Generate grid lines
    this.gridLines = [];
    for (let level = 1; level <= this.levels; level++) {
      const levelRadius = (level / this.levels) * this.maxRadius;
      const gridPoints: string[] = [];
      for (let i = 0; i < this.data.length; i++) {
        const angle = startAngle + i * angleStep;
        const x = this.centerX + levelRadius * Math.cos(angle);
        const y = this.centerY + levelRadius * Math.sin(angle);
        gridPoints.push(`${x},${y}`);
      }
      this.gridLines.push(gridPoints.join(' '));
    }
  }

  getAxisLine(index: number): string {
    const angleStep = (2 * Math.PI) / this.data.length;
    const startAngle = -Math.PI / 2;
    const angle = startAngle + index * angleStep;
    const x = this.centerX + this.maxRadius * Math.cos(angle);
    const y = this.centerY + this.maxRadius * Math.sin(angle);
    return `M${this.centerX},${this.centerY} L${x},${y}`;
  }
}
