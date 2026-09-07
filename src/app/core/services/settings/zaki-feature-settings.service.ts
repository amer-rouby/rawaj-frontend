import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { ApiResponse } from '../../models';
import { ZakiFeatureSettings, ZakiFeatureSettingsRequest } from '../../models/settings/zaki-feature-settings.model';
import { environment } from '../../../../environments/environment';

// Local-only flags default to enabled (no network dependency, no reason to hide
// them behind a settings-fetch failure); internet-dependent flags default to
// disabled so a transient settings-load failure can't silently enable a
// feature that would then hang waiting on a network call that isn't there.
const SAFE_DEFAULTS: ZakiFeatureSettings = {
  id: 0,
  storeId: 0,
  stockPredictionEnabled: true,
  reorderRecommendationsEnabled: true,
  pricingRecommendationsEnabled: true,
  supplierRecommendationsEnabled: true,
  dashboardInsightsEnabled: true,
  dailyBriefEnabled: true,
  anomalyDetectionEnabled: true,
  realtimeUpdatesEnabled: true,
  voiceSearchEnabled: true,
  customerCreditEnabled: true,
  aiAssistantEnabled: true,
  eInvoiceEnabled: false,
  offlineModeEnabled: false,
  emailEnabled: false
};

@Injectable({
  providedIn: 'root'
})
export class ZakiFeatureSettingsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/settings/zaki-features`;

  // Cached flags so feature components can gate themselves synchronously
  // (`if (!flags().stockPredictionEnabled) return;`) instead of a network
  // round-trip per check. Refreshed on login and whenever settings are saved.
  readonly flags = signal<ZakiFeatureSettings>(SAFE_DEFAULTS);

  private getStoreId(): number {
    return this.authService.getStoreId() || 1;
  }

  getSettings(): Observable<ZakiFeatureSettings> {
    const storeId = this.getStoreId();

    return this.http.get<ApiResponse<ZakiFeatureSettings>>(this.apiUrl, {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(
      map(response => response.data),
      tap(settings => this.flags.set(settings)),
      // Fall back to the last successfully-fetched value (SAFE_DEFAULTS on the
      // very first load) rather than silently enabling everything on a blip.
      catchError(this.handleError<ZakiFeatureSettings>('getSettings', this.flags()))
    );
  }

  updateSettings(request: ZakiFeatureSettingsRequest): Observable<ZakiFeatureSettings> {
    const storeId = this.getStoreId();

    return this.http.put<ApiResponse<ZakiFeatureSettings>>(this.apiUrl, request, {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(
      map(response => response.data),
      tap(settings => this.flags.set(settings)),
      catchError(this.handleError<ZakiFeatureSettings>('updateSettings'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
