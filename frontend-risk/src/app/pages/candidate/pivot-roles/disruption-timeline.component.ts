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
      active ? 'border-emerald-500/60 bg-emerald-500/5 shadow shadow-emerald-500/20' : 'border-slate-800 bg-slate-900/70',
      'hover:border-emerald-400 hover:shadow hover:shadow-emerald-500/10'
    ].join(' ');
  }

  textClasses(point: DisruptionPoint): string {
    const risk = point.automationRisk;
    if (risk <= 25) return 'text-emerald-300';
    if (risk <= 45) return 'text-amber-300';
    if (risk <= 65) return 'text-orange-300';
    return 'text-rose-300';
  }

  badgeClasses(point: DisruptionPoint): string {
    const risk = point.automationRisk;
    if (risk <= 25) return 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/40';
    if (risk <= 45) return 'bg-amber-500/15 text-amber-200 border border-amber-500/40';
    if (risk <= 65) return 'bg-orange-500/15 text-orange-200 border border-orange-500/40';
    return 'bg-rose-500/15 text-rose-200 border border-rose-500/40';
  }
}


