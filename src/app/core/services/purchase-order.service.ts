import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrudService } from '../abstracts/crud-service';
import { ApiResponse, PaginatedResponse } from '../models';
import { PurchaseOrder, PurchaseOrderStats, SendEmailResponse } from '../models/purchase-order.model';
import { PurchaseOrderRequest } from '../models/purchase-request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService extends CrudService<PurchaseOrder> {
  protected getUrlSegment(): string {
    return `${environment.apiUrl}/purchase-orders`;
  }

  protected override getPageUrlSegment(): string {
    return this.getUrlSegment();
  }

  protected createNewInstance(): PurchaseOrder {
    return new PurchaseOrder({ storeId: this.getStoreId(), status: 'DRAFT', priority: 'NORMAL', items: [] });
  }

  getOrders(page: number = 0, size: number = 10): Observable<PaginatedResponse<PurchaseOrder>> {
    return this.load(page, size);
  }

  getOrdersByStatus(status: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<PurchaseOrder>> {
    return this.http.get<ApiResponse<PaginatedResponse<PurchaseOrder>>>(`${this.getUrlSegment()}/status/${status}`, {
      params: new HttpParams().set('storeId', this.getStoreId()).set('page', page).set('size', size)
    }).pipe(map(response => {
      const page = response.data;
      return { ...page, content: page.content.map(item => this.cast(item)) };
    }));
  }

  getOrder(id: number): Observable<PurchaseOrder> {
    return this.loadById(id);
  }

  /**
   * The request/response shapes diverge too much for the generic toPayload() (items are
   * reshaped, totals/status/audit fields don't exist on the request), so these bypass the
   * base create()/update() and post the already-correctly-shaped request directly.
   */
  createOrder(request: PurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<ApiResponse<PurchaseOrder>>(this.getUrlSegment(), request, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => this.cast(response.data)));
  }

  updateOrder(id: number, request: PurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.put<ApiResponse<PurchaseOrder>>(`${this.getUrlSegment()}/${id}`, request, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => this.cast(response.data)));
  }

  deleteOrder(id: number): Observable<void> {
    return this.delete(id);
  }

  approveOrder(id: number): Observable<PurchaseOrder> {
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.getUrlSegment()}/${id}/approve`, null, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => this.cast(response.data)));
  }

  cancelOrder(id: number): Observable<PurchaseOrder> {
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.getUrlSegment()}/${id}/cancel`, null, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => this.cast(response.data)));
  }

  receiveOrder(id: number): Observable<PurchaseOrder> {
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.getUrlSegment()}/${id}/receive`, null, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => this.cast(response.data)));
  }

  getStats(): Observable<PurchaseOrderStats> {
    return this.http.get<ApiResponse<PurchaseOrderStats>>(`${this.getUrlSegment()}/count`, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => response.data));
  }

  // Deliberately no error fallback here - unlike a fetch, a failed send (no
  // supplier email on file, SMTP down, etc.) needs its real error message to reach
  // the caller so the UI can show *why* it failed, not swallow it into a generic result.
  sendEmail(orderId: number): Observable<SendEmailResponse> {
    return this.http.post<ApiResponse<SendEmailResponse>>(`${this.getUrlSegment()}/${orderId}/send-email`, null, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => response.data));
  }
}
