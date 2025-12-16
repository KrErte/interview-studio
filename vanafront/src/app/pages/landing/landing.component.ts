import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RiskApiService } from '../../services/risk-api.service';
import { AnalyzeRequest } from '../../models/risk.model';

@Component({
  standalone: true,
  selector: 'app-landing',
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  roleTitle = '';
  tenureYears = 0;
  cvText = '';
  loading = false;
  error?: string;

  constructor(
    private api: RiskApiService,
    private router: Router
  ) {}

  analyze() {
    this.error = undefined;
    if (!this.roleTitle || !this.cvText) {
      this.error = 'Amet ja CV tekst on kohustuslikud';
      return;
    }

    const req: AnalyzeRequest = {
      roleTitle: this.roleTitle,
      tenureYears: this.tenureYears,
      cvText: this.cvText
    };

    this.loading = true;
    this.api.analyze(req).subscribe({
      next: res => {
        sessionStorage.setItem('risk-prelim', JSON.stringify(res));
        this.router.navigate(['/risk/questions', res.analysisId]);
      },
      error: () => {
        this.error = 'Analüüs ebaõnnestus';
        this.loading = false;
      }
    });
  }
}
