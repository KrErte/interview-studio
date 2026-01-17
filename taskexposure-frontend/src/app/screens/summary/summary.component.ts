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

import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../shared/models/task.model';
import { RoadmapAction } from '../../shared/models/roadmap-action.model';
import { KpiGridComponent, KpiItem } from '../../shared/components/kpi-grid/kpi-grid.component';
import { SimulatorComponent } from '../../shared/components/simulator/simulator.component';
import {
  PersonaArchetype,
  PERSONA_ARCHETYPES,
  derivePersonaArchetype,
} from '../../shared/models/persona-archetype.model';
import { CopyService } from '../../core/services/copy.service';
import { SessionService } from '../../core/services/session.service';

/**
 * 3.8 Summary Screen - "The Commitment"
 *
 * PURPOSE: Close the loop. Provide portable summary.
 * Enable commitment tracking. Set up for return visits.
 *
 * Includes:
 * - Persona archetype display
 * - Committed actions summary
 * - "If you do nothing vs If you act" scenario
 * - Downloadable report
 */
@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, KpiGridComponent, SimulatorComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent {
  private copyService = inject(CopyService);
  private sessionService = inject(SessionService);

  get sessionId(): string | null {
    return this.sessionService.sessionId;
  }

  @Input() riskScore: number = 0;
  @Input() tasks: Task[] = [];
  @Input() topAction: RoadmapAction | undefined;
  @Input() committedActions: RoadmapAction[] = [];

  get copy() {
    return this.copyService.summaryCopy;
  }
  get scenarioCopy() {
    return this.copyService.scenarioCopy;
  }
  showScenario: boolean = false;

  /**
   * Get the user's perceived future role archetype.
   * TODO: Backend should provide this based on signal analysis.
   */
  get personaArchetype(): PersonaArchetype {
    const archetypeId = derivePersonaArchetype(this.riskScore);
    return PERSONA_ARCHETYPES[archetypeId];
  }

  get exposureBand(): string {
    return this.copyService.getExposureBand(this.riskScore);
  }

  get kpiItems(): KpiItem[] {
    return [
      {
        label: 'Exposure Score',
        value: this.riskScore,
        suffix: '%',
        color: this.getScoreColor(),
        icon: 'target',
      },
      {
        label: 'Automated Tasks',
        value: this.highExposureTasks.length,
        color: 'rose',
        icon: 'zap',
      },
      {
        label: 'Human Moats',
        value: this.lowExposureTasks.length,
        color: 'emerald',
        icon: 'shield',
      },
      {
        label: 'Total Tasks',
        value: this.tasks.length,
        color: 'accent',
        icon: 'chart',
      },
      {
        label: 'AI-Assisted',
        value: this.mediumExposureTasks.length,
        color: 'amber',
        icon: 'clock',
      },
      {
        label: 'Committed Actions',
        value: this.committedActions.length,
        color: 'purple',
        icon: 'users',
      },
    ];
  }

  private getScoreColor(): 'low' | 'medium' | 'high' {
    if (this.riskScore <= 30) return 'low';
    if (this.riskScore <= 60) return 'medium';
    return 'high';
  }

  get scoreColorClass(): string {
    if (this.riskScore <= 30) return 'summary__score--low';
    if (this.riskScore <= 60) return 'summary__score--medium';
    return 'summary__score--high';
  }

  get highExposureTasks(): Task[] {
    return this.tasks.filter((t) => t.exposure === 'high');
  }

  get lowExposureTasks(): Task[] {
    return this.tasks.filter((t) => t.exposure === 'low');
  }

  get mediumExposureTasks(): Task[] {
    return this.tasks.filter((t) => t.exposure === 'medium');
  }

  toggleScenario(): void {
    this.showScenario = !this.showScenario;
  }

  downloadReport(): void {
    const reportContent = this.generateReportText();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskexposure-report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private generateReportText(): string {
    let report = 'TASKEXPOSURE Assessment Report\n';
    report += '================================\n\n';
    report += `${this.copy.sections.score}: ${this.riskScore}%\n`;
    report += `Band: ${this.exposureBand.toUpperCase()}\n\n`;

    // Archetype
    report += `${this.copy.sections.archetype}:\n`;
    report += `${this.personaArchetype.name}\n`;
    report += `${this.personaArchetype.description}\n\n`;

    if (this.highExposureTasks.length > 0) {
      report += `${this.copy.sections.highExposure} (AUTOMATED):\n`;
      this.highExposureTasks.forEach((t) => {
        report += `- ${t.description}\n`;
      });
      report += '\n';
    }

    if (this.lowExposureTasks.length > 0) {
      report += `${this.copy.sections.lowExposure} (HUMAN MOATS):\n`;
      this.lowExposureTasks.forEach((t) => {
        report += `- ${t.description}\n`;
      });
      report += '\n';
    }

    if (this.committedActions.length > 0) {
      report += `${this.copy.sections.committedActions}:\n`;
      this.committedActions.forEach((a, i) => {
        report += `${i + 1}. ${a.description}\n`;
      });
      report += '\n';
    } else if (this.topAction) {
      report += `${this.copy.sections.topAction}:\n`;
      report += `${this.topAction.description}\n`;
      report += `${this.topAction.explanation ?? this.topAction.mechanism}\n\n`;
    }

    report += '---\n\n';
    report += `${this.copy.nextSteps}\n\n`;
    report += `${this.copy.returnPrompt}\n`;

    return report;
  }
}
