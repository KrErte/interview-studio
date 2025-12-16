import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardJobAnalysis } from '../../../api/models/dashboard.model';
import { DashboardService, JobMatchDto, RunJobMatchPayload } from '../../../api/services/dashboard.service';

@Component({
  selector: 'app-match-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match-tab.component.html',
  styleUrls: ['./match-tab.component.scss']
})
export class MatchTabComponent implements OnInit {
  loading = false;
  error: string | null = null;
  results: JobMatchDto[] = [];
  sessions: DashboardJobAnalysis[] = [];
  targetRole = '';
  jobDescription = '';

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  submit(): void {
    if (!this.targetRole.trim()) {
      return;
    }
    this.run({
      targetRole: this.targetRole.trim(),
      jobDescription: this.jobDescription?.trim() || null
    });
  }

  private run(payload: RunJobMatchPayload): void {
    this.loading = true;
    this.error = null;
    this.dashboardService.runJobMatch(payload).subscribe({
      next: (res) => {
        this.results = res ?? [];
        this.loading = false;
        this.loadSessions();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to run match.';
        this.loading = false;
      }
    });
  }

  private loadSessions(): void {
    this.dashboardService.getJobMatchSessions().subscribe({
      next: (res) => {
        this.sessions = res ?? [];
      },
      error: () => {
        this.sessions = [];
      }
    });
  }

  trackById(_index: number, item: JobMatchDto): string {
    return item.id || `${item.role || 'role'}-${_index}`;
  }

  trackBySessionId(_index: number, item: DashboardJobAnalysis): string {
    return item.id || `${item.role || 'session'}-${_index}`;
  }
}





