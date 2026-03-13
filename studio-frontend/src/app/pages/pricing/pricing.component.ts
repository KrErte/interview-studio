import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PricingService, PricingTier } from '../../services/pricing.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pricing.component.html'
})
export class PricingComponent implements OnInit {
  tiers: PricingTier[] = [];
  currentTierId: string | null = null;
  loading = true;
  error: string | null = null;
  checkoutSuccess = false;

  constructor(
    private pricingService: PricingService,
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkoutSuccess = this.route.snapshot.queryParamMap.get('success') === 'true';

    this.pricingService.getTiers().subscribe({
      next: (tiers) => {
        this.tiers = tiers;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load pricing plans. Please try again.';
        this.loading = false;
      }
    });

    if (this.auth.isLoggedIn()) {
      this.pricingService.getCurrentTier().subscribe({
        next: (res) => this.currentTierId = res.tier,
        error: () => {} // silently ignore — user just won't see "Your plan" badge
      });
    }
  }

  selectTier(tier: PricingTier): void {
    if (tier.id === 'FREE') return;
    if (this.currentTierId === tier.id) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/register']);
      return;
    }

    const successUrl = `${window.location.origin}/pricing?success=true`;
    const cancelUrl = `${window.location.origin}/pricing`;

    this.pricingService.createCheckout(tier.id, successUrl, cancelUrl).subscribe({
      next: (res) => {
        window.location.href = res.checkoutUrl;
      },
      error: () => {
        this.error = 'Failed to start checkout. Please try again.';
      }
    });
  }

  getButtonLabel(tier: PricingTier): string {
    if (tier.id === 'FREE') {
      return this.auth.isLoggedIn() ? 'Current plan' : 'Get started';
    }
    if (this.currentTierId === tier.id) return 'Current plan';
    return this.auth.isLoggedIn() ? 'Upgrade' : 'Sign up';
  }

  isButtonDisabled(tier: PricingTier): boolean {
    if (tier.id === 'FREE' && this.auth.isLoggedIn()) return true;
    return this.currentTierId === tier.id;
  }
}
