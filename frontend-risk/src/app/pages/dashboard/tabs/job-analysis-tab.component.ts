import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardJobAnalysis } from '../../../api/models/dashboard.model';
import { DashboardService } from '../../../api/services/dashboard.service';

@Component({
  selector: 'app-job-analysis-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-analysis-tab.component.html',
  styleUrls: ['./job-analysis-tab.component.scss']
})
export class JobAnalysisTabComponent implements OnInit {
  loading = false;
  analyses: DashboardJobAnalysis[] = [];

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.dashboardService.getJobMatchSessions().subscribe({
      next: (res) => {
        this.analyses = res ?? [];
        this.loading = false;
      },
      error: () => {
        this.analyses = [];
        this.loading = false;
      }
    });
  }

  trackById(_index: number, item: DashboardJobAnalysis): string {
    return item.id || `${item.role || 'analysis'}-${_index}`;
  }
}





