import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CandidateSummaryStateService } from './candidate-summary-state.service';
import { CandidateSummaryDto } from '../../core/models/interview-session.model';

@Component({
  selector: 'app-candidate-summary-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-summary-panel.component.html',
  styleUrls: ['./candidate-summary-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateSummaryPanelComponent implements OnInit, OnDestroy {
  readonly summary$ = this.summaryState.summary$;

  evidenceOpen = false;
  private latestSummary: CandidateSummaryDto | null = null;
  private sub?: Subscription;

  constructor(private readonly summaryState: CandidateSummaryStateService) {}

  ngOnInit(): void {
    this.sub = this.summary$.subscribe((s) => {
      this.latestSummary = s;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleEvidence(): void {
    this.evidenceOpen = !this.evidenceOpen;
  }

  copySummary(): void {
    const summary = this.latestSummary;
    if (!summary) {
      return;
    }

    const parts: string[] = [];
    parts.push('Candidate summary');
    parts.push('');
    parts.push(summary.narrative);
    parts.push('');

    if (summary.strengths?.length) {
      parts.push('Strengths:');
      for (const s of summary.strengths) {
        parts.push(`- ${s}`);
      }
      parts.push('');
    }

    if (summary.risks?.length) {
      parts.push('Risks:');
      for (const r of summary.risks) {
        parts.push(`- ${r}`);
      }
      parts.push('');
    }

    if (summary.signals?.length) {
      parts.push('Signals:');
      for (const sig of summary.signals) {
        parts.push(`- [${sig.confidence}] ${sig.label}`);
      }
      parts.push('');
    }

    parts.push(
      `Answers so far: ${summary.answeredCount} · Updated at: ${summary.updatedAt}`
    );

    const text = parts.join('\n');
    this.copyToClipboard(text);
  }

  private copyToClipboard(text: string): void {
    if (!text) {
      return;
    }

    const nav: any = navigator as any;
    if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
      nav.clipboard.writeText(text).catch(() => {
        // swallow copy errors
      });
      return;
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      // ignore
    }
  }
}


