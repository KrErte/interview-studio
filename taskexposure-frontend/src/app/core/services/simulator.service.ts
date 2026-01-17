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

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SimulatorOption,
  SimulatorOptionsResponse,
  SimulationResult,
  SimulateRequest,
  AffectedTask,
} from '../../shared/models/simulator.model';
import { Task } from '../../shared/models/task.model';

@Injectable({
  providedIn: 'root',
})
export class SimulatorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/simulate`;

  // Default skill options
  private readonly defaultSkills: SimulatorOption[] = [
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      description: 'Data automation, scripting, AI/ML tooling',
      category: 'skill',
    },
    {
      id: 'prompt-engineering',
      name: 'Prompt Engineering',
      icon: '🤖',
      description: 'Effective AI interaction and output optimization',
      category: 'skill',
    },
    {
      id: 'stakeholder-management',
      name: 'Stakeholder Management',
      icon: '👥',
      description: 'Cross-functional communication and influence',
      category: 'skill',
    },
    {
      id: 'data-analysis',
      name: 'Data Analysis',
      icon: '📊',
      description: 'Advanced analytics and business intelligence',
      category: 'skill',
    },
    {
      id: 'system-design',
      name: 'System Design',
      icon: '🏗️',
      description: 'Architecture and scalability planning',
      category: 'skill',
    },
    {
      id: 'leadership',
      name: 'Leadership',
      icon: '🎯',
      description: 'Team guidance and strategic decision-making',
      category: 'skill',
    },
  ];

  // Default AI capability options
  private readonly defaultAiCapabilities: SimulatorOption[] = [
    {
      id: 'code-generation',
      name: 'Code Generation',
      icon: '💻',
      description: 'AI can write production-ready code from specs',
      category: 'ai-capability',
    },
    {
      id: 'autonomous-debugging',
      name: 'Autonomous Debugging',
      icon: '🔍',
      description: 'AI can find and fix bugs without human guidance',
      category: 'ai-capability',
    },
    {
      id: 'strategic-planning',
      name: 'Strategic Planning',
      icon: '📈',
      description: 'AI can make long-term business decisions',
      category: 'ai-capability',
    },
    {
      id: 'client-negotiation',
      name: 'Client Negotiation',
      icon: '🤝',
      description: 'AI can handle complex client interactions',
      category: 'ai-capability',
    },
    {
      id: 'creative-direction',
      name: 'Creative Direction',
      icon: '🎨',
      description: 'AI can lead creative projects and make aesthetic decisions',
      category: 'ai-capability',
    },
    {
      id: 'team-management',
      name: 'Team Management',
      icon: '👔',
      description: 'AI can manage and motivate human teams',
      category: 'ai-capability',
    },
  ];

  /**
   * Get available simulation options.
   * GET /api/simulate/options
   */
  getOptions(): Observable<SimulatorOptionsResponse> {
    // For demo/local mode, return mock data
    // In production, this would call the API
    return of({
      skills: this.defaultSkills,
      aiCapabilities: this.defaultAiCapabilities,
    }).pipe(delay(300));
  }

  /**
   * Simulate skill acquisition effect on exposure.
   * POST /api/simulate/skill
   */
  simulateSkill(request: SimulateRequest): Observable<SimulationResult> {
    // For demo/local mode, calculate mock result
    // In production, this would call the API
    return this.calculateMockSimulation(request, 'skill');
  }

  /**
   * Simulate AI capability advancement effect on exposure.
   * POST /api/simulate/ai-capability
   */
  simulateAiCapability(request: SimulateRequest): Observable<SimulationResult> {
    // For demo/local mode, calculate mock result
    // In production, this would call the API
    return this.calculateMockSimulation(request, 'ai-capability');
  }

  private calculateMockSimulation(
    request: SimulateRequest,
    type: 'skill' | 'ai-capability'
  ): Observable<SimulationResult> {
    const option = type === 'skill'
      ? this.defaultSkills.find(s => s.id === request.optionId)
      : this.defaultAiCapabilities.find(c => c.id === request.optionId);

    if (!option) {
      return of({
        optionId: request.optionId,
        optionName: 'Unknown',
        currentExposure: request.currentExposure,
        newExposure: request.currentExposure,
        delta: 0,
        affectedTasks: [],
      }).pipe(delay(500));
    }

    // Calculate exposure change based on type
    // Skills reduce exposure, AI capabilities increase it
    const baseChange = type === 'skill' ? -1 : 1;
    const variability = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
    const impactFactor = this.getImpactFactor(request.optionId, type);
    const delta = Math.round(baseChange * impactFactor * variability * 10);

    const newExposure = Math.max(5, Math.min(95, request.currentExposure + delta));

    // Generate affected tasks
    const affectedTasks = this.generateAffectedTasks(request.tasks, delta, type);

    return of({
      optionId: request.optionId,
      optionName: option.name,
      currentExposure: request.currentExposure,
      newExposure,
      delta: newExposure - request.currentExposure,
      affectedTasks,
    }).pipe(delay(500));
  }

  private getImpactFactor(optionId: string, type: 'skill' | 'ai-capability'): number {
    // Different options have different impact magnitudes
    const skillImpacts: Record<string, number> = {
      'python': 0.8,
      'prompt-engineering': 1.0,
      'stakeholder-management': 0.7,
      'data-analysis': 0.6,
      'system-design': 0.9,
      'leadership': 0.8,
    };

    const aiImpacts: Record<string, number> = {
      'code-generation': 1.2,
      'autonomous-debugging': 0.9,
      'strategic-planning': 0.7,
      'client-negotiation': 0.5,
      'creative-direction': 0.6,
      'team-management': 0.4,
    };

    const impacts = type === 'skill' ? skillImpacts : aiImpacts;
    return impacts[optionId] ?? 0.5;
  }

  private generateAffectedTasks(
    tasks: { description: string; exposure: string }[],
    delta: number,
    type: 'skill' | 'ai-capability'
  ): AffectedTask[] {
    if (!tasks || tasks.length === 0) {
      return [];
    }

    // Affect 1-3 tasks randomly
    const numAffected = Math.min(tasks.length, Math.floor(Math.random() * 3) + 1);
    const shuffled = [...tasks].sort(() => Math.random() - 0.5);
    const selectedTasks = shuffled.slice(0, numAffected);

    return selectedTasks.map(task => {
      const currentExposure = this.exposureToPercent(task.exposure);
      // Each task gets a portion of the total delta with some variance
      const taskDeltaBase = (delta / numAffected) * (Math.random() * 0.6 + 0.7);
      const taskDelta = Math.round(taskDeltaBase);
      const newExposure = Math.max(5, Math.min(95, currentExposure + taskDelta));

      return {
        taskDescription: task.description,
        currentExposure,
        newExposure,
        delta: newExposure - currentExposure,
      };
    });
  }

  private exposureToPercent(exposure: string): number {
    switch (exposure) {
      case 'high': return 75 + Math.floor(Math.random() * 15);
      case 'medium': return 45 + Math.floor(Math.random() * 20);
      case 'low': return 15 + Math.floor(Math.random() * 20);
      default: return 50;
    }
  }
}
