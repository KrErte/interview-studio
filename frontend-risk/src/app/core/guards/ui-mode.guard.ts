import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router, UrlTree } from '@angular/router';
import { UiModeService, UiMode } from '../services/ui-mode.service';

/**
 * Route guard factory that checks if the current UI mode matches the required mode.
 * Use this to conditionally allow/block routes based on Simple vs Advanced mode.
 *
 * @example
 * // Only allow route in advanced mode
 * { path: 'power-tools', canActivate: [uiModeGuard('advanced')], component: PowerToolsComponent }
 *
 * // Only allow route in simple mode
 * { path: 'basic-view', canActivate: [uiModeGuard('simple')], component: BasicViewComponent }
 */
export function uiModeGuard(requiredMode: UiMode, redirectTo?: string): CanActivateFn {
  return () => {
    const uiModeService = inject(UiModeService);
    const router = inject(Router);

    const currentMode = uiModeService.getMode();

    if (currentMode === requiredMode) {
      return true;
    }

    // If redirect path provided, navigate there; otherwise just block
    if (redirectTo) {
      return router.createUrlTree([redirectTo]);
    }

    // Default: redirect to home
    return router.createUrlTree(['/']);
  };
}

/**
 * CanMatch guard factory for lazy-loaded routes.
 * Prevents route matching entirely based on UI mode.
 *
 * @example
 * {
 *   path: 'advanced-section',
 *   canMatch: [uiModeCanMatch('advanced')],
 *   loadChildren: () => import('./advanced/advanced.routes')
 * }
 */
export function uiModeCanMatch(requiredMode: UiMode): CanMatchFn {
  return () => {
    const uiModeService = inject(UiModeService);
    return uiModeService.getMode() === requiredMode;
  };
}

/**
 * Helper to create a route config that shows different components based on UI mode.
 * Useful for defining parallel routes that swap based on mode.
 *
 * @example
 * // In routes file:
 * ...createModeBasedRoutes('dashboard', SimpleDashboardComponent, AdvancedDashboardComponent)
 */
export function createModeBasedRoutes(
  path: string,
  simpleComponent: any,
  advancedComponent: any
) {
  return [
    {
      path,
      canMatch: [uiModeCanMatch('simple')],
      component: simpleComponent
    },
    {
      path,
      canMatch: [uiModeCanMatch('advanced')],
      component: advancedComponent
    }
  ];
}

/**
 * Helper function to check current UI mode in components or services.
 * Returns the current UiModeService instance for reactive usage.
 *
 * @example
 * // In a component
 * uiMode = inject(UiModeService);
 * // In template: @if (uiMode.isSimple()) { ... }
 */
export function injectUiMode(): UiModeService {
  return inject(UiModeService);
}
