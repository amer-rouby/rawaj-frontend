import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CrudService } from '../abstracts/crud-service';
import { ApiResponse, PaginatedResponse } from '../models';
import { Supplier } from '../models/supplier.model';
import { SupplierRequest } from '../models/purchase-request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupplierService extends CrudService<Supplier> {
  protected getUrlSegment(): string {
    return `${environment.apiUrl}/suppliers`;
  }

  protected override getPageUrlSegment(): string {
    return `${this.getUrlSegment()}/paginated`;
  }

  protected createNewInstance(): Supplier {
    return new Supplier({ storeId: this.getStoreId(), status: 'ACTIVE' });
  }

  protected override toPayload(item: Supplier): object {
    const { storeId, ...rest } = super.toPayload(item) as Record<string, unknown>;
    void storeId;
    return rest;
  }

  getSuppliers(page: number = 0, size: number = 10): Observable<PaginatedResponse<Supplier>> {
    return this.load(page, size);
  }

  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<ApiResponse<Supplier[]>>(this.getUrlSegment(), {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(
      map(response => (response.data || []).map(item => this.cast(item))),
      catchError(() => of([]))
    );
  }

  getSupplier(id: number): Observable<Supplier> {
    return this.loadById(id);
  }

  /** Bypasses the base create() - this endpoint requires storeId as a query param, not in the body. */
  createSupplier(request: SupplierRequest): Observable<Supplier> {
    return this.http.post<ApiResponse<Supplier>>(this.getUrlSegment(), request, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => this.cast(response.data)));
  }

  updateSupplier(id: number, request: SupplierRequest): Observable<Supplier> {
    return this.update(new Supplier({ ...(request as Partial<Supplier>), id }));
  }

  deleteSupplier(id: number): Observable<void> {
    return this.delete(id);
  }

  searchSuppliers(query: string): Observable<Supplier[]> {
    if (!query?.trim()) return of([]);
    return this.http.get<ApiResponse<Supplier[]>>(`${this.getUrlSegment()}/search`, {
      params: new HttpParams().set('storeId', this.getStoreId()).set('query', query.trim())
    }).pipe(
      map(response => (response.data || []).map(item => this.cast(item))),
      catchError(() => of([]))
    );
  }
}
