import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiResponse } from '../../models';
import { NotificationSettings, NotificationSettingsRequest } from '../../models/settings/notification-setting.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationSettingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/settings/notifications`;

  // Cached so any component (the settings screen, the header's live alert
  // logic) reads the same up-to-date values instead of each fetching its
  // own copy once and going stale after another component saves a change.
  readonly settings = signal<NotificationSettings | null>(null);

  getSettings(): Observable<NotificationSettings> {
    return this.http.get<ApiResponse<NotificationSettings>>(this.apiUrl).pipe(
      map(response => response.data),
      tap(settings => this.settings.set(settings)),
      catchError(this.handleError<NotificationSettings>('getSettings'))
    );
  }

  updateSettings(request: NotificationSettingsRequest): Observable<NotificationSettings> {
    return this.http.put<ApiResponse<NotificationSettings>>(this.apiUrl, request).pipe(
      map(response => response.data),
      tap(settings => this.settings.set(settings))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}
