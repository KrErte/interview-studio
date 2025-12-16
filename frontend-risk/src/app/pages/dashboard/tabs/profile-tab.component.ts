import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../api/services/dashboard.service';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-tab.component.html',
  styleUrls: ['./profile-tab.component.scss']
})
export class ProfileTabComponent implements OnInit {
  loading = false;
  profileSummary: string | null = null;
  cvSummary: string | null = null;
  skillProfileSummary: string | null = null;

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.load();
  }

  get hasContent(): boolean {
    return !!(this.profileSummary || this.cvSummary || this.skillProfileSummary);
  }

  private load(): void {
    this.loading = true;
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        this.profileSummary = res?.profileSummary ?? null;
        this.cvSummary = res?.cvSummary ?? null;
        this.skillProfileSummary = res?.skillProfileSummary ?? null;
        this.loading = false;
      },
      error: () => {
        this.profileSummary = null;
        this.cvSummary = null;
        this.skillProfileSummary = null;
        this.loading = false;
      }
    });
  }
}





