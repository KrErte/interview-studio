import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewFitSnapshot } from '../../core/models/interview-session.model';

export interface InterviewFitInsight {
  type: 'STRENGTH' | 'RISK';
  text: string;
}

export interface InterviewFitDimensionBreakdown {
  key: string;
  label: string;
  scorePercent: number | null;
  band: string | null;
  insights: InterviewFitInsight[] | null;
}

export interface InterviewFitBreakdown {
  confidence: string | null; // LOW|MEDIUM|HIGH
  answeredCount: number;
  dimensions: InterviewFitDimensionBreakdown[] | null;
}

@Component({
  selector: 'app-fit-explain-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fit-explain-panel.component.html',
  styleUrls: ['./fit-explain-panel.component.scss']
})
export class FitExplainPanelComponent {
  @Input() open = false;
  @Input() fit: InterviewFitSnapshot | null = null;
  @Input() breakdown: InterviewFitBreakdown | null = null;

  @Output() closed = new EventEmitter<void>();

  onBackdropClick(): void {
    this.closed.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.closed.emit();
    }
  }

  /**
   * True when backend has started computing fit and we have crossed the
   * minimum answer threshold for showing numeric fit in the main widget.
   * Mirrors the same rule used in the fit indicator (>=3 answers).
   */
  get hasFitComputed(): boolean {
    const answered = this.breakdown?.answeredCount ?? 0;
    if (answered < 3) {
      return false;
    }
    return this.fit?.computed === true && this.fit.overall !== null;
  }

  /**
   * Whether it makes sense to talk about trend at all.
   * Follows the same shape as the main widget: only after ~5 answers and
   * when a trend label exists.
   */
  get showTrendExplanation(): boolean {
    const answered = this.breakdown?.answeredCount ?? 0;
    if (answered < 5) {
      return false;
    }
    const raw = (this.fit?.trend || '').toString().trim();
    return raw.length > 0;
  }

  private get normalizedTrend(): 'IMPROVING' | 'FLAT' | 'DECLINING' | 'UNKNOWN' {
    const raw = (this.fit?.trend || '').toString().trim().toUpperCase();
    if (raw === 'IMPROVING') return 'IMPROVING';
    if (raw === 'DECLINING') return 'DECLINING';
    if (raw === 'FLAT') return 'FLAT';
    return 'UNKNOWN';
  }

  trendLabel(): string {
    const t = this.normalizedTrend;
    if (t === 'IMPROVING') return 'Tõusuteel';
    if (t === 'DECLINING') return 'Languses';
    if (t === 'FLAT') return 'Stabiilne';
    return 'Stabiilne';
  }

  dimensionStrengths(): InterviewFitDimensionBreakdown[] {
    if (!this.breakdown?.dimensions) {
      return [];
    }
    return this.breakdown.dimensions.filter(d =>
      (d.insights || []).some(i => i.type === 'STRENGTH')
    );
  }

  dimensionRisks(): InterviewFitDimensionBreakdown[] {
    if (!this.breakdown?.dimensions) {
      return [];
    }
    return this.breakdown.dimensions.filter(d =>
      (d.insights || []).some(i => i.type === 'RISK')
    );
  }

  strengthInsights(dim: InterviewFitDimensionBreakdown): InterviewFitInsight[] {
    const list = dim.insights || [];
    return list.filter(i => i.type === 'STRENGTH');
  }

  riskInsights(dim: InterviewFitDimensionBreakdown): InterviewFitInsight[] {
    const list = dim.insights || [];
    return list.filter(i => i.type === 'RISK');
  }

  confidenceLabel(): string {
    const c = (this.breakdown?.confidence || '').toUpperCase();
    if (c === 'HIGH') return 'High confidence';
    if (c === 'MEDIUM') return 'Medium confidence';
    if (c === 'LOW') return 'Low confidence';
    return 'Unknown confidence';
  }

  confidenceClass(): string {
    const c = (this.breakdown?.confidence || '').toUpperCase();
    if (c === 'HIGH') return 'border-emerald-500 text-emerald-300';
    if (c === 'MEDIUM') return 'border-amber-500 text-amber-300';
    if (c === 'LOW') return 'border-slate-500 text-slate-200';
    return 'border-slate-700 text-slate-300';
  }

  bandLabel(band: string | null): string {
    const value = (band || '').toUpperCase();
    if (value === 'STRONG') return 'Strong';
    if (value === 'GOOD') return 'Good';
    if (value === 'NEEDS_WORK') return 'Needs work';
    return '—';
  }
}


