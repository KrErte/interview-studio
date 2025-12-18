import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  PivotRolesService,
  RoleMatch,
  FutureProofScore
} from '../../../services/pivot-roles.service';
import {
  CandidateMarketplaceService,
  MarketplaceVisibilityMode,
  MarketplaceVisibilitySettings
} from '../../../services/candidate-marketplace.service';

@Component({
  selector: 'app-pivot-roles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pivot-roles.page.html',
  styleUrls: ['./pivot-roles.page.scss']
})
export class PivotRolesPageComponent implements OnInit {
  email: string | null = null;

  roleMatches: RoleMatch[] = [];
  loadingRoles = false;
  rolesError: string | null = null;

  futureScore: FutureProofScore | null = null;
  loadingScore = false;
  scoreError: string | null = null;

  // Benchmark data for field comparison
  benchmarkPercentile = 15;   // "Top X%" - computed from backend or derived from score
  benchmarkFieldAverage = 58; // Field average score for comparison

  visibility: MarketplaceVisibilitySettings | null = null;
  visibilityDraftMode: MarketplaceVisibilityMode = 'OFF';
  visibilityDraftThreshold = 70;
  loadingVisibility = false;
  savingVisibility = false;
  visibilityError: string | null = null;
  visibilitySavedMessage: string | null = null;

  constructor(
    private readonly pivotRoles: PivotRolesService,
    private readonly marketplace: CandidateMarketplaceService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.auth.getCurrentUserEmail();
    if (!this.email) {
      this.rolesError = 'Please log in again to see your pivot roles.';
      this.scoreError = 'Please log in again to see your future-proof score.';
      this.visibilityError = 'Please log in again to adjust marketplace visibility.';
      return;
    }

    this.loadRoleMatches(this.email);
    this.loadFutureProofScore(this.email);
    this.loadVisibility(this.email);
  }

  get hasAnyData(): boolean {
    return !!(this.roleMatches.length || this.futureScore || this.visibility);
  }

  onGeneratePlan(match: RoleMatch): void {
    // For now, reuse existing roadmap flow; backend can later accept a role id.
    this.router.navigate(['/candidate/roadmap'], {
      queryParams: { pivotRoleId: match.id }
    });
  }

  isVisibilityMode(mode: MarketplaceVisibilityMode): boolean {
    return this.visibilityDraftMode === mode;
  }

  setVisibilityMode(mode: MarketplaceVisibilityMode): void {
    this.visibilityDraftMode = mode;
    this.visibilitySavedMessage = null;
  }

  onThresholdChange(value: number): void {
    this.visibilityDraftThreshold = Math.max(0, Math.min(100, value));
    this.visibilitySavedMessage = null;
  }

  saveVisibility(): void {
    if (!this.email) {
      this.visibilityError = 'Please log in again to update marketplace visibility.';
      return;
    }

    const payload: MarketplaceVisibilitySettings = {
      mode: this.visibilityDraftMode,
      visibilityThreshold: this.visibilityDraftThreshold
    };

    this.savingVisibility = true;
    this.visibilityError = null;
    this.visibilitySavedMessage = null;

    this.marketplace.updateSettings(this.email, payload).subscribe({
      next: (res) => {
        this.visibility = res;
        this.visibilityDraftMode = res.mode;
        this.visibilityDraftThreshold = res.visibilityThreshold;
        this.savingVisibility = false;
        this.visibilitySavedMessage = 'Marketplace visibility updated.';
      },
      error: (err) => {
        this.visibilityError =
          err?.error?.message || 'Could not update marketplace visibility. Please try again.';
        this.savingVisibility = false;
      }
    });
  }

  private loadRoleMatches(email: string): void {
    this.loadingRoles = true;
    this.rolesError = null;
    this.pivotRoles.getRoleMatches(email).subscribe({
      next: (roles) => {
        this.roleMatches = roles ?? [];
        this.loadingRoles = false;
      },
      error: (err) => {
        this.rolesError =
          err?.error?.message || 'Could not load pivot roles. Please try again.';
        this.loadingRoles = false;
      }
    });
  }

  private loadFutureProofScore(email: string): void {
    this.loadingScore = true;
    this.scoreError = null;
    this.pivotRoles.getFutureProofScore(email).subscribe({
      next: (score) => {
        this.futureScore = score ?? null;
        this.loadingScore = false;
      },
      error: (err) => {
        this.scoreError =
          err?.error?.message || 'Could not load future-proof score. Please try again.';
        this.loadingScore = false;
      }
    });
  }

  private loadVisibility(email: string): void {
    this.loadingVisibility = true;
    this.visibilityError = null;
    this.marketplace.getSettings(email).subscribe({
      next: (settings) => {
        this.visibility = settings ?? null;
        if (settings) {
          this.visibilityDraftMode = settings.mode;
          this.visibilityDraftThreshold = settings.visibilityThreshold;
        }
        this.loadingVisibility = false;
      },
      error: (err) => {
        this.visibilityError =
          err?.error?.message || 'Could not load marketplace visibility settings.';
        this.loadingVisibility = false;
      }
    });
  }
}


