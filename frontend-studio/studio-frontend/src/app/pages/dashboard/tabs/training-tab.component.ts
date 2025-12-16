import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardTraining } from '../../../api/models/dashboard.model';

@Component({
  selector: 'app-training-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-tab.component.html',
  styleUrls: ['./training-tab.component.scss']
})
export class TrainingTabComponent {
  @Input() loading = false;
  @Input() training: DashboardTraining | null = null;

  get completed(): number {
    return this.training?.completedTasks ?? 0;
  }

  get total(): number {
    return this.training?.totalTasks ?? 0;
  }

  get progressPercent(): number {
    return Math.max(0, Math.min(100, this.training?.progressPercent ?? 0));
  }
}


