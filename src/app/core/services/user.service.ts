import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';
import { HttpParams } from '@angular/common/http';
import { Observable, finalize, map, tap } from 'rxjs';
import { CrudServiceWithDialog } from '../abstracts/crud-service-with-dialog';
import { User, UserRole } from '../models/user.model';
import { ApiResponse, PaginatedResponse } from '../models';
import { environment } from '../../../environments/environment';
import { UserDialogComponent } from '../../features/users/user-dialog/user-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UserService extends CrudServiceWithDialog<UserDialogComponent, User> {
  protected getUrlSegment(): string {
    return `${environment.apiUrl}/users`;
  }

  protected createNewInstance(): User {
    return new User({ storeId: this.getStoreId(), role: UserRole.PHARMACIST, isActive: true });
  }

  getDialogComponent(): ComponentType<UserDialogComponent> {
    return UserDialogComponent;
  }

  protected override toPayload(item: User): object {
    const payload = super.toPayload(item) as Record<string, unknown>;
    delete payload['lastLoginAt'];
    delete payload['storeName'];
    if (!payload['password']) delete payload['password'];
    return payload;
  }

  // The backend's user list/search endpoints return every matching user in one array with
  // no server-side paging support, so pagination is done here client-side (same as before).
  override load(page = 0, size = 10, search?: string): Observable<PaginatedResponse<User>> {
    this.isLoading.set(true);
    const params = new HttpParams().set('storeId', this.getStoreId());
    const source$ = search?.trim()
      ? this.http.get<ApiResponse<User[]>>(`${this.getUrlSegment()}/search`, {
          params: params.set('query', search.trim())
        })
      : this.http.get<ApiResponse<User[]>>(this.getUrlSegment(), { params });

    return source$.pipe(
      map(response => (response.data || []).map(item => this.cast(item))),
      map(all => {
        const start = page * size;
        const content = all.slice(start, start + size);
        return {
          content,
          totalElements: all.length,
          totalPages: Math.max(1, Math.ceil(all.length / size)),
          size,
          number: page,
          first: page === 0,
          last: start + size >= all.length,
          empty: all.length === 0
        } as PaginatedResponse<User>;
      }),
      tap(result => this.paginatedItems.set(result)),
      finalize(() => this.isLoading.set(false))
    );
  }
}
