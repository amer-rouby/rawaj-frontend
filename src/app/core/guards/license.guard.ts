import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { LicenseService } from '../services/license.service';

// Runs after authGuard on every top-level navigation. Deliberately fails OPEN
// on a network/server error (rather than locking the store out) - a transient
// glitch reaching our own local backend must never look like a subscription
// lockout to a paying customer; the cost of a rare missed enforcement window
// is far lower than the cost of a false lockout.
export const licenseGuard: CanActivateFn = (route, state) => {
  // Always allow the renewal page itself, otherwise an expired store could
  // never reach the one screen that lets it fix that.
  if (state.url.startsWith('/license')) {
    return true;
  }

  const licenseService = inject(LicenseService);
  const router = inject(Router);

  return licenseService.ensureStatusLoaded().pipe(
    map((status) => {
      if (status.expired) {
        router.navigate(['/license/renew']);
        return false;
      }
      return true;
    }),
    catchError(() => of(true))
  );
};
