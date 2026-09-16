import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrudService } from '../abstracts/crud-service';
import { environment } from '../../../environments/environment';
import { StockBatch, StockAdjustmentHistory } from '../models/stock.model';
import { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import { Product } from '../models/product.model';

/**
 * Every method here takes storeId explicitly rather than resolving it internally like other
 * CrudService entities do - that's the existing convention its 5 consumers already rely on,
 * so it's kept as-is rather than forced to match and requiring consumer changes.
 */
@Injectable({
  providedIn: 'root'
})
export class StockBatchService extends CrudService<StockBatch> {
  protected getUrlSegment(): string {
    return `${environment.apiUrl}/stock/batches`;
  }

  protected createNewInstance(): StockBatch {
    return new StockBatch({ status: 'ACTIVE' });
  }

  private toBatchPayload(batch: Partial<StockBatch>): object {
    const { id, createdAt, updatedAt, storeId, productName, version, ...rest } = batch as Record<string, unknown>;
    void id; void createdAt; void updatedAt; void storeId; void productName; void version;
    return rest;
  }

  getBatches(storeId: number, page: number = 0, size: number = 20): Observable<PaginatedResponse<StockBatch>> {
    const params = new HttpParams().set('storeId', storeId).set('page', page).set('size', size);
    return this.http.get<ApiResponse<PaginatedResponse<StockBatch>>>(this.getUrlSegment(), { params }).pipe(
      map(response => {
        const page = response.data;
        return { ...page, content: page.content.map(item => this.cast(item)) };
      })
    );
  }

  getBatch(id: number, storeId: number): Observable<StockBatch> {
    return this.http.get<ApiResponse<StockBatch>>(`${this.getUrlSegment()}/${id}`, {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(map(response => this.cast(response.data)));
  }

  createBatch(batch: Partial<StockBatch>, storeId: number): Observable<StockBatch> {
    return this.http.post<ApiResponse<StockBatch>>(this.getUrlSegment(), this.toBatchPayload(batch), {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(map(response => this.cast(response.data)));
  }

  updateBatch(id: number, batch: Partial<StockBatch>, storeId: number): Observable<StockBatch> {
    return this.http.put<ApiResponse<StockBatch>>(`${this.getUrlSegment()}/${id}`, this.toBatchPayload(batch), {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(map(response => this.cast(response.data)));
  }

  deleteBatch(id: number, storeId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.getUrlSegment()}/${id}`, {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(map(response => response.data));
  }

  getProducts(storeId: number = 4): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${environment.apiUrl}/products`, {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(map(response => response.data));
  }

  getExpiringBatches(storeId: number, days: number = 30): Observable<StockBatch[]> {
    return this.http.get<ApiResponse<StockBatch[]>>(`${this.getUrlSegment()}/expiring`, {
      params: new HttpParams().set('storeId', storeId).set('days', days)
    }).pipe(map(response => (response.data || []).map(item => this.cast(item))));
  }

  getExpiredBatches(storeId: number): Observable<StockBatch[]> {
    return this.http.get<ApiResponse<StockBatch[]>>(`${this.getUrlSegment()}/expired`, {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(map(response => (response.data || []).map(item => this.cast(item))));
  }

  adjustStock(batchId: number, adjustment: unknown, storeId: number): Observable<StockBatch> {
    return this.http.post<ApiResponse<StockBatch>>(`${this.getUrlSegment()}/${batchId}/adjust`, adjustment, {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(map(response => this.cast(response.data)));
  }

  getAdjustmentHistory(batchId: number, storeId: number): Observable<StockAdjustmentHistory[]> {
    return this.http.get<ApiResponse<StockAdjustmentHistory[]>>(`${this.getUrlSegment()}/${batchId}/adjustments`, {
      params: new HttpParams().set('storeId', storeId)
    }).pipe(map(response => response.data));
  }
}
