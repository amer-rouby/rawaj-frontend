import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiResponse } from '../models';
import { GeneratedLicenseCode, LicenseStatus } from '../models/license.model';
import { StoreContextService } from './store-context.service';

@Injectable({ providedIn: 'root' })
export class LicenseService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(StoreContextService);
  private readonly apiUrl = this.store.apiUrl('license');

  // Cached for the session so navigating between screens doesn't add a
  // network round-trip per route change - refreshed after a successful renew.
  private readonly cachedStatus = signal<LicenseStatus | null>(null);

  /** Returns the cached status if already fetched this session, otherwise fetches it. */
  ensureStatusLoaded(): Observable<LicenseStatus> {
    const cached = this.cachedStatus();
    if (cached) return of(cached);
    return this.fetchStatus();
  }

  fetchStatus(): Observable<LicenseStatus> {
    return this.http.get<ApiResponse<LicenseStatus>>(`${this.apiUrl}/status`).pipe(
      map((response) => response.data),
      tap((status) => this.cachedStatus.set(status))
    );
  }

  renew(code: string): Observable<LicenseStatus> {
    return this.http.post<ApiResponse<LicenseStatus>>(`${this.apiUrl}/renew`, { code }).pipe(
      map((response) => response.data),
      tap((status) => this.cachedStatus.set(status))
    );
  }

  // Vendor-only: only works on this instance's own backend, which is the
  // sole place license.private-key-path is ever configured.
  generateCode(licenseKey: string, months: number): Observable<GeneratedLicenseCode> {
    return this.http.post<ApiResponse<GeneratedLicenseCode>>(`${this.apiUrl}/generate`, { licenseKey, months }).pipe(
      map((response) => response.data)
    );
  }
}
