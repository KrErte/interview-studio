import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RiskFlowStore } from '../risk-flow.store';

@Component({
  selector: 'app-risk-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-page.component.html',
  styleUrls: ['./risk-page.component.scss'],
})
export class RiskPageComponent {
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;
  readonly score$ = this.store.score$;
  readonly confidence$ = this.store.confidence$;
  readonly signals$ = this.store.signals$;
  readonly roadmap$ = this.store.roadmap$;

  constructor(private store: RiskFlowStore) {}

  onImproveAccuracy(): void {
    // Placeholder - logic to be implemented
  }
}
