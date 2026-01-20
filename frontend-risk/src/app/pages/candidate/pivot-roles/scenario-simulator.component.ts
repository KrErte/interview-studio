import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

interface Scenario {
  id: string;
  action: string;
  timeInvestment: string;
  riskChange: number;
  salaryChange: number;
  demandChange: number;
  description: string;
}

interface SimulationResult {
  originalRisk: number;
  newRisk: number;
  originalSalary: number;
  projectedSalary: number;
  timeToImpact: string;
  confidence: number;
  tradeoffs: string[];
}

@Component({
  selector: 'app-scenario-simulator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      <!-- Header -->
      <div class="px-5 pt-5 pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">What-If Simulator</h3>
            <p class="text-xs text-slate-500">See how different choices affect your career trajectory</p>
          </div>
        </div>
      </div>

      <!-- Scenario cards -->
      <div class="p-5">
        <div class="grid gap-3 md:grid-cols-2">
          <button
            *ngFor="let scenario of scenarios"
            type="button"
            class="group relative p-4 rounded-xl border text-left transition-all duration-300"
            [ngClass]="getScenarioClasses(scenario)"
            (click)="selectScenario(scenario)"
          >
            <!-- Selection indicator -->
            <div
              *ngIf="selectedScenario?.id === scenario.id"
              class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center"
            >
              <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>

            <div class="flex items-start justify-between gap-3 mb-3">
              <span class="text-sm font-semibold text-white">{{ scenario.action }}</span>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400">
                {{ scenario.timeInvestment }}
              </span>
            </div>

            <p class="text-xs text-slate-400 mb-3">{{ scenario.description }}</p>

            <!-- Quick impact preview -->
            <div class="flex items-center gap-4 text-xs">
              <div class="flex items-center gap-1">
                <span class="text-slate-500">Risk:</span>
                <span [ngClass]="scenario.riskChange < 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ scenario.riskChange > 0 ? '+' : '' }}{{ scenario.riskChange }}%
                </span>
              </div>
              <div class="flex items-center gap-1">
                <span class="text-slate-500">Salary:</span>
                <span [ngClass]="scenario.salaryChange > 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ scenario.salaryChange > 0 ? '+' : '' }}{{ scenario.salaryChange }}%
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Simulation results -->
      <div *ngIf="simulationResult" class="px-5 pb-5">
        <div class="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-bold text-white">Simulation Result</h4>
            <span class="text-xs text-slate-400">{{ simulationResult.confidence }}% confidence</span>
          </div>

          <!-- Before/After comparison -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="p-3 rounded-lg bg-slate-900/50">
              <div class="text-xs text-slate-500 mb-1">Current State</div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-mono font-bold text-slate-400">{{ simulationResult.originalRisk }}%</span>
                <span class="text-xs text-slate-500">risk</span>
              </div>
              <div class="text-sm text-slate-400">\${{ simulationResult.originalSalary | number }}k/yr</div>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/50">
              <div class="text-xs text-emerald-400 mb-1">After {{ selectedScenario?.timeInvestment }}</div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-mono font-bold" [ngClass]="simulationResult.newRisk < simulationResult.originalRisk ? 'text-emerald-400' : 'text-rose-400'">
                  {{ simulationResult.newRisk }}%
                </span>
                <span class="text-xs text-slate-500">risk</span>
              </div>
              <div class="text-sm text-emerald-400">\${{ simulationResult.projectedSalary | number }}k/yr</div>
            </div>
          </div>

          <!-- Visual comparison bar -->
          <div class="relative h-8 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              class="absolute inset-y-0 left-0 bg-slate-600 transition-all duration-500"
              [style.width.%]="simulationResult.originalRisk"
            ></div>
            <div
              class="absolute inset-y-0 left-0 transition-all duration-500"
              [ngClass]="simulationResult.newRisk < simulationResult.originalRisk ? 'bg-emerald-500' : 'bg-rose-500'"
              [style.width.%]="simulationResult.newRisk"
            ></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-bold text-white drop-shadow-lg">
                {{ simulationResult.newRisk < simulationResult.originalRisk ? '↓' : '↑' }}
                {{ Math.abs(simulationResult.newRisk - simulationResult.originalRisk) }}% risk
              </span>
            </div>
          </div>

          <!-- Tradeoffs -->
          <div class="space-y-2">
            <div class="text-xs text-slate-500 uppercase tracking-wide">Tradeoffs to Consider</div>
            <div *ngFor="let tradeoff of simulationResult.tradeoffs" class="flex items-start gap-2 text-sm text-slate-300">
              <span class="text-amber-400 mt-0.5">•</span>
              <span>{{ tradeoff }}</span>
            </div>
          </div>

          <!-- Action button -->
          <button
            type="button"
            class="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            (click)="selectedScenario && applyScenario.emit(selectedScenario)"
          >
            Add "{{ selectedScenario?.action }}" to My Roadmap
          </button>
        </div>
      </div>

      <!-- Compare mode hint -->
      <div *ngIf="!simulationResult" class="px-5 pb-5">
        <div class="p-4 rounded-lg border border-dashed border-slate-700 text-center">
          <p class="text-sm text-slate-400">Select a scenario above to simulate its impact on your career</p>
        </div>
      </div>
    </div>
  `
})
export class ScenarioSimulatorComponent implements OnInit {
  @Input() currentRisk = 43;
  @Input() currentSalary = 95;
  @Output() applyScenario = new EventEmitter<Scenario>();

  Math = Math;

  scenarios: Scenario[] = [
    {
      id: 'learn-ai',
      action: 'Learn AI/ML Engineering',
      timeInvestment: '6 months',
      riskChange: -18,
      salaryChange: 25,
      demandChange: 40,
      description: 'Complete a comprehensive AI/ML certification and build 3 portfolio projects'
    },
    {
      id: 'pivot-pm',
      action: 'Pivot to Technical PM',
      timeInvestment: '3 months',
      riskChange: -12,
      salaryChange: 15,
      demandChange: 20,
      description: 'Transition from IC to product management leveraging technical background'
    },
    {
      id: 'specialize-security',
      action: 'Specialize in AI Security',
      timeInvestment: '4 months',
      riskChange: -22,
      salaryChange: 30,
      demandChange: 55,
      description: 'Focus on emerging AI security challenges - adversarial ML, model safety'
    },
    {
      id: 'start-consulting',
      action: 'Start AI Consulting',
      timeInvestment: '2 months',
      riskChange: -8,
      salaryChange: 40,
      demandChange: 15,
      description: 'Leverage expertise to consult for companies implementing AI solutions'
    },
    {
      id: 'build-audience',
      action: 'Build Technical Audience',
      timeInvestment: '12 months',
      riskChange: -15,
      salaryChange: 20,
      demandChange: 25,
      description: 'Create content, build newsletter, establish thought leadership'
    },
    {
      id: 'stay-course',
      action: 'Stay Current Path',
      timeInvestment: '0 months',
      riskChange: 8,
      salaryChange: 3,
      demandChange: -10,
      description: 'Continue current trajectory without major changes'
    }
  ];

  selectedScenario: Scenario | null = null;
  simulationResult: SimulationResult | null = null;

  ngOnInit(): void {}

  selectScenario(scenario: Scenario): void {
    this.selectedScenario = scenario;
    this.runSimulation(scenario);
  }

  private runSimulation(scenario: Scenario): void {
    // Simulate calculation with slight randomization for realism
    const newRisk = Math.max(5, Math.min(95, this.currentRisk + scenario.riskChange));
    const newSalary = Math.round(this.currentSalary * (1 + scenario.salaryChange / 100));

    const tradeoffMap: Record<string, string[]> = {
      'learn-ai': [
        'Requires dedicated 10-15 hours/week for 6 months',
        'Initial projects may not generate income',
        'Fast-moving field requires continuous learning'
      ],
      'pivot-pm': [
        'May face perception bias from pure PM candidates',
        'Salary may dip initially before recovering',
        'Less hands-on technical work'
      ],
      'specialize-security': [
        'Niche market - fewer total opportunities but less competition',
        'Requires staying current with rapidly evolving threats',
        'May need security clearances for some roles'
      ],
      'start-consulting': [
        'Income variability - feast or famine cycles',
        'Must handle sales, marketing, admin',
        'No employer benefits (healthcare, 401k match)'
      ],
      'build-audience': [
        'Long-term play - minimal returns first 6 months',
        'Requires consistent content creation',
        'Public exposure has personal risks'
      ],
      'stay-course': [
        'Risk compounds over time as AI advances',
        'Harder to pivot later with outdated skills',
        'May face layoffs in market downturns'
      ]
    };

    this.simulationResult = {
      originalRisk: this.currentRisk,
      newRisk,
      originalSalary: this.currentSalary,
      projectedSalary: newSalary,
      timeToImpact: scenario.timeInvestment,
      confidence: 70 + Math.floor(Math.random() * 20),
      tradeoffs: tradeoffMap[scenario.id] || []
    };
  }

  getScenarioClasses(scenario: Scenario): string {
    const isSelected = this.selectedScenario?.id === scenario.id;
    if (isSelected) {
      return 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/50';
    }
    if (scenario.riskChange < 0) {
      return 'border-slate-700 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-emerald-500/5';
    }
    return 'border-slate-700 bg-slate-900/50 hover:border-slate-600';
  }
}
