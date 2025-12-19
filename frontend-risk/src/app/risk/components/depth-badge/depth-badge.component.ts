import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DepthPreferenceService } from '../../services/depth-preference.service';
import { AssessmentDepth } from '../../models/depth.model';
import { DEPTH_LABELS } from '../../i18n/depth-labels';

@Component({
  selector: 'app-depth-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
             bg-emerald-900/50 text-emerald-400 border border-emerald-700 cursor-help"
      [title]="getTooltip()"
    >
      <span>{{ getIcon() }}</span>
      <span>{{ getLabel() }}</span>
    </span>
  `
})
export class DepthBadgeComponent {
  private depthService = inject(DepthPreferenceService);
  private labels = DEPTH_LABELS.et.badge;

  readonly depth = this.depthService.depth;

  getIcon(): string {
    return this.depth() === AssessmentDepth.QUICK ? '⚡' : '🔬';
  }

  getLabel(): string {
    return this.depth() === AssessmentDepth.QUICK ? this.labels.quick : this.labels.deep;
  }

  getTooltip(): string {
    return this.depth() === AssessmentDepth.QUICK ? this.labels.tooltipQuick : this.labels.tooltipDeep;
  }
}

