import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CandidateDiscoveryFilters,
  CandidateDiscoveryService,
  CandidateSummary
} from '../../../services/candidate-discovery.service';

@Component({
  selector: 'app-candidate-discovery-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-discovery.page.html',
  styleUrls: ['./candidate-discovery.page.scss']
})
export class CandidateDiscoveryPageComponent implements OnInit {
  filters: CandidateDiscoveryFilters = {
    query: '',
    minScore: 60,
    visibilityModes: ['ANON', 'PUBLIC']
  };

  loading = false;
  error: string | null = null;

  candidates: CandidateSummary[] = [];
  selectedCandidate: CandidateSummary | null = null;

  constructor(private readonly discovery: CandidateDiscoveryService) {}

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    this.loading = true;
    this.error = null;
    this.candidates = [];
    this.selectedCandidate = null;

    this.discovery.searchCandidates(this.filters).subscribe({
      next: (list) => {
        this.candidates = list ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err?.error?.message || 'Could not load candidates. Please try again.';
        this.loading = false;
      }
    });
  }

  selectCandidate(candidate: CandidateSummary): void {
    this.selectedCandidate = candidate;
  }

  clearSelection(): void {
    this.selectedCandidate = null;
  }

  trackByCandidateId(_index: number, item: CandidateSummary): string {
    return item.id;
  }
}


