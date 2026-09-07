import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, timeout } from 'rxjs/operators';
import { ApiResponse } from '../models';
import { StoreContextService } from './store-context.service';
import { withHttpErrorFallback } from '../utils/http-error.util';
import { EInvoiceSubmission } from '../models/einvoice.model';

@Injectable({ providedIn: 'root' })
export class EInvoiceService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(StoreContextService);
  private readonly apiUrl = this.store.apiUrl('e-invoice');

  // Reads our own backend's DB row about a submission - not a live proxy call
  // to ETA, so it gets a shorter timeout than submit/retry below. `null` here
  // legitimately means "no submission yet", so swallowing to null is correct.
  getForSale(saleId: number): Observable<EInvoiceSubmission | null> {
    return this.http.get<ApiResponse<EInvoiceSubmission>>(`${this.apiUrl}/${saleId}`).pipe(
      timeout(5000),
      map((response) => response.data),
      withHttpErrorFallback<EInvoiceSubmission | null>('getForSale', null)
    );
  }

  // submit/retry proxy to the real ETA integration - errors (including a
  // timeout) must reach the caller so the cashier/admin sees a real warning
  // instead of a silently swallowed null (see sale-details-dialog.component.ts).
  submit(saleId: number): Observable<EInvoiceSubmission | null> {
    return this.http.post<ApiResponse<EInvoiceSubmission>>(`${this.apiUrl}/${saleId}/submit`, {}).pipe(
      timeout(8000),
      map((response) => response.data)
    );
  }

  retry(saleId: number): Observable<EInvoiceSubmission | null> {
    return this.http.post<ApiResponse<EInvoiceSubmission>>(`${this.apiUrl}/${saleId}/retry`, {}).pipe(
      timeout(8000),
      map((response) => response.data)
    );
  }
}
