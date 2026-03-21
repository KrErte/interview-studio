import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

export interface DisruptionPoint {
  year: number;
  automationRisk: number;
  insight: string;
}

@Component({
  selector: 'app-disruption-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disruption-timeline.component.html'
})
export class DisruptionTimelineComponent implements OnInit {
  @Input() currentRole = 'Your Role';
  @Input() timeline: DisruptionPoint[] = [];

  activePoint: DisruptionPoint | null = null;

  ngOnInit(): void {
    if (this.timeline?.length) {
      this.activePoint = this.timeline[0];
    }
  }

  setActive(point: DisruptionPoint): void {
    this.activePoint = point;
  }

  resetActive(): void {
    this.activePoint = this.activePoint || null;
  }

  riskLabel(risk: number): string {
    if (risk <= 25) return 'Low';
    if (risk <= 45) return 'Moderate';
    if (risk <= 65) return 'High';
    return 'Very High';
  }

  riskBand(risk: number): 'green' | 'amber' | 'red' {
    if (risk <= 45) return 'green';
    if (risk <= 65) return 'amber';
    return 'red';
  }

  riskHint(point: DisruptionPoint | null): string | null {
    if (!point) return null;
    const band = this.riskBand(point.automationRisk);
    if (band === 'amber') return 'Recommended to begin preparation within 12-24 months.';
    if (band === 'red') return 'Recommended to take action before this year.';
    return null;
  }

  tileClasses(point: DisruptionPoint): string {
    const active = this.activePoint?.year === point.year;
    return [
      active ? 'border-red-600 bg-stone-50 shadow-sm' : 'border-stone-200 bg-white',
      'hover:border-stone-900 hover:shadow-sm'
    ].join(' ');
  }

  textClasses(point: DisruptionPoint): string {
    const risk = point.automationRisk;
    if (risk <= 25) return 'text-stone-900';
    if (risk <= 45) return 'text-amber-700';
    if (risk <= 65) return 'text-orange-700';
    return 'text-red-600';
  }

  badgeClasses(point: DisruptionPoint): string {
    const risk = point.automationRisk;
    if (risk <= 25) return 'bg-stone-900 text-white';
    if (risk <= 45) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (risk <= 65) return 'bg-orange-50 text-orange-700 border border-orange-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  }
}


