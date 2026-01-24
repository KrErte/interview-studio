import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface NearTermPeriod {
  id: string;
  label: string;
  months: string;
  whatChanges: string;
  whatToDo: string;
  urgency: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-near-term-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="near-term-container">
      <div class="header">
        <div>
          <p class="label">Sinu tegevuskava</p>
          <h3 class="title">Mida teha järgmise 18 kuu jooksul</h3>
          <p class="subtitle">{{ currentRole || 'Sinu roll' }}</p>
        </div>
        <div class="confidence-badge" [ngClass]="confidenceClass">
          <span class="confidence-label">Hinnangu kindlus:</span>
          <span class="confidence-value">{{ confidenceLabel }}</span>
        </div>
      </div>

      <div class="timeline-cards">
        <div
          *ngFor="let period of periods; let idx = index"
          class="period-card"
          [ngClass]="cardClasses(period)"
          [class.active]="activePeriod?.id === period.id"
          (click)="selectPeriod(period)"
          (keydown.enter)="selectPeriod(period)"
          tabindex="0"
          [attr.aria-label]="period.label + ': ' + period.whatToDo"
        >
          <div class="period-header">
            <span class="period-months">{{ period.months }}</span>
            <span class="urgency-badge" [ngClass]="'urgency-' + period.urgency">
              {{ urgencyLabel(period.urgency) }}
            </span>
          </div>

          <div class="period-content">
            <div class="change-section">
              <span class="section-label">Mis muutub:</span>
              <p class="section-text">{{ period.whatChanges }}</p>
            </div>

            <div class="action-section">
              <span class="section-label">Mida teha:</span>
              <p class="section-text action-text">{{ period.whatToDo }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Expandable long-term view -->
      <div class="long-term-section">
        <button
          type="button"
          class="accordion-toggle"
          (click)="showLongTerm = !showLongTerm"
          [attr.aria-expanded]="showLongTerm"
        >
          <span>{{ showLongTerm ? '▼' : '▶' }} Vaata pikaajalist prognoosi (2+ aastat)</span>
        </button>

        <div class="accordion-content" *ngIf="showLongTerm">
          <p class="long-term-note">
            Pikaajalised prognoosid on vähem täpsed, kuid annavad aimu suunast.
          </p>
          <div class="long-term-cards">
            <div *ngFor="let point of longTermPoints" class="long-term-card">
              <span class="year">{{ point.year }}</span>
              <span class="risk" [ngClass]="riskClass(point.risk)">{{ point.risk }}% risk</span>
              <p class="insight">{{ point.insight }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA section -->
      <div class="cta-section">
        <button type="button" class="cta-primary" (click)="onGeneratePlan.emit()">
          Anna mulle 12 kuu plaan →
        </button>
        <button type="button" class="cta-secondary" (click)="onShowDetails.emit()">
          Vaata detailset arvutust
        </button>
      </div>
    </div>
  `,
  styles: [`
    .near-term-container {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 16px;
      padding: 1.25rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0;
    }

    .subtitle {
      font-size: 0.875rem;
      color: #94a3b8;
      margin-top: 0.25rem;
    }

    .confidence-badge {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.75rem;
    }

    .confidence-badge.high {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .confidence-badge.medium {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .confidence-badge.low {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .confidence-label {
      color: #64748b;
      font-size: 0.625rem;
    }

    .confidence-value {
      font-weight: 600;
    }

    .high .confidence-value { color: #10b981; }
    .medium .confidence-value { color: #f59e0b; }
    .low .confidence-value { color: #ef4444; }

    .timeline-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }

    @media (max-width: 900px) {
      .timeline-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 500px) {
      .timeline-cards {
        grid-template-columns: 1fr;
      }
    }

    .period-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 12px;
      padding: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .period-card:hover {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(30, 41, 59, 0.7);
    }

    .period-card:focus {
      outline: none;
      box-shadow: 0 0 0 2px #10b981;
    }

    .period-card.active {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.05);
    }

    .period-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .period-months {
      font-weight: 600;
      color: #e2e8f0;
      font-size: 0.875rem;
    }

    .urgency-badge {
      font-size: 0.625rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 12px;
      text-transform: uppercase;
    }

    .urgency-low {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    .urgency-medium {
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
    }

    .urgency-high {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .period-content {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .section-label {
      font-size: 0.625rem;
      text-transform: uppercase;
      color: #64748b;
      display: block;
      margin-bottom: 0.125rem;
    }

    .section-text {
      font-size: 0.8125rem;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.4;
    }

    .action-text {
      color: #10b981;
      font-weight: 500;
    }

    .long-term-section {
      margin-top: 1rem;
      border-top: 1px solid rgba(51, 65, 85, 0.5);
      padding-top: 1rem;
    }

    .accordion-toggle {
      background: none;
      border: none;
      color: #64748b;
      font-size: 0.8125rem;
      cursor: pointer;
      padding: 0.5rem 0;
      transition: color 0.2s;
    }

    .accordion-toggle:hover {
      color: #94a3b8;
    }

    .accordion-content {
      margin-top: 0.75rem;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .long-term-note {
      font-size: 0.75rem;
      color: #64748b;
      font-style: italic;
      margin-bottom: 0.75rem;
    }

    .long-term-cards {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .long-term-card {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(51, 65, 85, 0.3);
      border-radius: 8px;
      padding: 0.75rem;
      flex: 1;
      min-width: 150px;
    }

    .long-term-card .year {
      font-weight: 600;
      color: #94a3b8;
      font-size: 0.875rem;
      display: block;
    }

    .long-term-card .risk {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .risk.low { color: #10b981; }
    .risk.moderate { color: #f59e0b; }
    .risk.high { color: #ef4444; }

    .long-term-card .insight {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.5rem;
      line-height: 1.4;
    }

    .cta-section {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
      flex-wrap: wrap;
    }

    .cta-primary {
      flex: 1;
      min-width: 200px;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      border-radius: 10px;
      padding: 0.875rem 1.5rem;
      color: #fff;
      font-weight: 600;
      font-size: 0.9375rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cta-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .cta-secondary {
      background: transparent;
      border: 1px solid rgba(100, 116, 139, 0.5);
      border-radius: 10px;
      padding: 0.875rem 1.5rem;
      color: #94a3b8;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .cta-secondary:hover {
      border-color: #94a3b8;
      color: #e2e8f0;
    }
  `]
})
export class NearTermTimelineComponent {
  @Input() currentRole = '';
  @Input() confidence: 'low' | 'medium' | 'high' = 'medium';
  @Input() periods: NearTermPeriod[] = [];
  @Input() longTermPoints: { year: number; risk: number; insight: string }[] = [];

  @Output() onGeneratePlan = new EventEmitter<void>();
  @Output() onShowDetails = new EventEmitter<void>();

  activePeriod: NearTermPeriod | null = null;
  showLongTerm = false;

  get confidenceClass(): string {
    return this.confidence;
  }

  get confidenceLabel(): string {
    switch (this.confidence) {
      case 'high': return 'Kõrge';
      case 'medium': return 'Keskmine';
      case 'low': return 'Madal';
    }
  }

  selectPeriod(period: NearTermPeriod): void {
    this.activePeriod = period;
  }

  urgencyLabel(urgency: string): string {
    switch (urgency) {
      case 'low': return 'Rahulik';
      case 'medium': return 'Aktiivne';
      case 'high': return 'Kiire';
      default: return '';
    }
  }

  cardClasses(period: NearTermPeriod): string {
    return '';
  }

  riskClass(risk: number): string {
    if (risk <= 30) return 'low';
    if (risk <= 50) return 'moderate';
    return 'high';
  }
}
