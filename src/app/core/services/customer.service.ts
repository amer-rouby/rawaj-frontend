import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CrudService } from '../abstracts/crud-service';
import { ApiResponse, PaginatedResponse } from '../models';
import { Customer, CustomerPaymentRequest, CustomerRequest, CustomerStatement } from '../models/customer.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomerService extends CrudService<Customer> {
  protected getUrlSegment(): string {
    return `${environment.apiUrl}/customers`;
  }

  protected override getPageUrlSegment(): string {
    return `${this.getUrlSegment()}/paginated`;
  }

  protected createNewInstance(): Customer {
    return new Customer({ storeId: this.getStoreId(), status: 'ACTIVE', creditLimit: 0, currentBalance: 0, availableCredit: 0 });
  }

  protected override toPayload(item: Customer): object {
    const { storeId, currentBalance, availableCredit, ...rest } = super.toPayload(item) as Record<string, unknown>;
    void storeId; void currentBalance; void availableCredit;
    return rest;
  }

  getCustomers(page: number = 0, size: number = 10): Observable<PaginatedResponse<Customer>> {
    return this.load(page, size);
  }

  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<ApiResponse<Customer[]>>(this.getUrlSegment(), {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(
      map(response => (response.data || []).map(item => this.cast(item))),
      catchError(() => of([]))
    );
  }

  getCustomer(id: number): Observable<Customer> {
    return this.loadById(id);
  }

  /** Bypasses the base create() - this endpoint requires storeId as a query param, not in the body. */
  createCustomer(request: CustomerRequest): Observable<Customer> {
    return this.http.post<ApiResponse<Customer>>(this.getUrlSegment(), request, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => this.cast(response.data)));
  }

  updateCustomer(id: number, request: CustomerRequest): Observable<Customer> {
    return this.update(new Customer({ ...(request as Partial<Customer>), id }));
  }

  deleteCustomer(id: number): Observable<void> {
    return this.delete(id);
  }

  searchCustomers(query: string): Observable<Customer[]> {
    if (!query?.trim()) return of([]);
    return this.http.get<ApiResponse<Customer[]>>(`${this.getUrlSegment()}/search`, {
      params: new HttpParams().set('storeId', this.getStoreId()).set('query', query.trim())
    }).pipe(
      map(response => (response.data || []).map(item => this.cast(item))),
      catchError(() => of([]))
    );
  }

  getStatement(id: number): Observable<CustomerStatement | null> {
    return this.http.get<ApiResponse<CustomerStatement>>(`${this.getUrlSegment()}/${id}/statement`, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(
      map(response => response.data),
      catchError(() => of(null))
    );
  }

  recordPayment(id: number, request: CustomerPaymentRequest): Observable<Customer> {
    return this.http.post<ApiResponse<Customer>>(`${this.getUrlSegment()}/${id}/payment`, request, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => this.cast(response.data)));
  }
}
