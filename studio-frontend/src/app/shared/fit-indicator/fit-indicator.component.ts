import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fit-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fit-indicator.component.html',
  styleUrls: ['./fit-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FitIndicatorComponent {
  /**
   * Canonical overall fit score in percent (0–100), taken directly from backend fit.overall.
   */
  @Input() overall: number | null | undefined = null;

  /**
   * Canonical current focus dimension key/label, typically fit.currentDimension.
   */
  @Input() focusDimension: string | null | undefined = null;

  /**
   * Canonical trend label ("IMPROVING" | "FLAT" | "DECLINING"), taken from backend fit.trend.
   */
  @Input() trend: string | null | undefined = null;

  /** Whether backend has actually computed fit already */
  @Input() computed: boolean | null | undefined = null;

  /** number of answered questions used to gate visibility */
  @Input() questionCount: number | null | undefined = null;

  /** compact mode reduces padding/font and focuses on dimension line */
  @Input() compact: boolean = false;

  /**
   * Effective answered question count for gating rules.
   */
  get answeredCount(): number {
    return this.questionCount ?? 0;
  }

  /**
   * Whether we are still learning about the candidate and should show
   * "Tutvume sinuga" instead of a numeric score.
   *
   * Rules:
   * - If questionCount < 3 OR fit.computed is false OR fit.overall is null.
   */
  get isExplorationPhase(): boolean {
    if (this.answeredCount < 3) {
      return true;
    }
    if (this.computed !== true) {
      return true;
    }
    if (this.overall === null || this.overall === undefined) {
      return true;
    }
    return false;
  }

  /**
   * Overall fit value formatted as integer percent, without computing from
   * any local model – we rely fully on backend-provided percent.
   */
  get overallDisplay(): string | null {
    if (this.overall === null || this.overall === undefined) {
      return null;
    }
    const n = Number(this.overall);
    if (Number.isNaN(n)) {
      return null;
    }
    return Math.round(n).toString();
  }

  /**
   * True if we should show a trend badge.
   *
   * Rules:
   * - Only when answeredCount >= 5 AND a trend label exists.
   */
  get showTrend(): boolean {
    if (this.answeredCount < 5) {
      return false;
    }
    const label = (this.trend || '').toString().trim();
    return label.length > 0;
  }

  private get normalizedTrend(): 'IMPROVING' | 'FLAT' | 'DECLINING' | 'UNKNOWN' {
    const raw = (this.trend || '').toString().trim().toUpperCase();
    if (raw === 'IMPROVING') return 'IMPROVING';
    if (raw === 'DECLINING') return 'DECLINING';
    if (raw === 'FLAT') return 'FLAT';
    return 'UNKNOWN';
  }

  get trendSymbol(): string {
    const t = this.normalizedTrend;
    if (t === 'IMPROVING') return '↑';
    if (t === 'DECLINING') return '↓';
    if (t === 'FLAT') return '→';
    return '→';
  }

  get trendText(): string {
    const t = this.normalizedTrend;
    if (t === 'IMPROVING') return 'Tõusuteel';
    if (t === 'DECLINING') return 'Languses';
    if (t === 'FLAT') return 'Stabiilne';
    return 'Stabiilne';
  }

  /**
   * Whether we have a focus dimension that should be rendered as a small pill.
   * Only when fit.computed === true and focusDimension is present.
   */
  get showFocusDimension(): boolean {
    if (this.computed !== true) {
      return false;
    }
    const label = (this.focusDimension || '').toString().trim();
    return label.length > 0;
  }
}
