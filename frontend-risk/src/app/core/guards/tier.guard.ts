import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TierService, UserTier } from '../services/tier.service';

export function tierGuard(requiredTier: UserTier): CanActivateFn {
  return () => {
    const tierService = inject(TierService);
    const router = inject(Router);

    if (tierService.isAtLeast(requiredTier)) {
      return true;
    }

    return router.createUrlTree(['/pricing']);
  };
}
