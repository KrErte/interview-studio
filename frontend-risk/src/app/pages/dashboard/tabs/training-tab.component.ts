import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingApiService, TrainingStatus } from '../../../core/services/training-api.service';

@Component({
  selector: 'app-training-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-tab.component.html',
  styleUrls: ['./training-tab.component.scss']
})
export class TrainingTabComponent implements OnInit {
  loading = false;
  training: TrainingStatus | null = null;

  constructor(private readonly trainingApi: TrainingApiService) {}

  ngOnInit(): void {
    this.load();
  }

  get completed(): number {
    return this.training?.completedTasks ?? 0;
  }

  get total(): number {
    return this.training?.totalTasks ?? 0;
  }

  get progressPercent(): number {
    return Math.max(0, Math.min(100, this.training?.progressPercent ?? 0));
  }

  private load(): void {
    this.loading = true;
    this.trainingApi.getTrainingStatus().subscribe({
      next: (res) => {
        this.training = res;
        this.loading = false;
      },
      error: () => {
        this.training = null;
        this.loading = false;
      }
    });
  }
}





