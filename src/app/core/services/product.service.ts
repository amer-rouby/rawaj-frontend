import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CrudService } from '../abstracts/crud-service';
import { ApiResponse, PaginatedResponse } from '../models';
import { Product, ProductRequest } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends CrudService<Product> {
  protected getUrlSegment(): string {
    return `${environment.apiUrl}/products`;
  }

  protected createNewInstance(): Product {
    return new Product({ storeId: this.getStoreId(), unitType: 'PIECE', minStockLevel: 10 });
  }

  getProductsPaged(page: number, size: number, search?: string, category?: string,
                    sortBy = 'name', sortDirection = 'asc'): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('storeId', this.getStoreId())
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (search?.trim()) params = params.set('search', search.trim());
    if (category && category !== 'all') params = params.set('category', category);

    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(`${this.getUrlSegment()}/page`, { params }).pipe(
      map(response => {
        const page = response.data;
        return { ...page, content: page.content.map(item => this.cast(item)) };
      }),
      catchError(() => of(this.emptyPage()))
    );
  }

  getProductsList(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(this.getUrlSegment(), {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(
      map(response => (response.data || []).map(item => this.cast(item))),
      catchError(() => of([]))
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.loadById(id);
  }

  createProduct(product: ProductRequest): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.getUrlSegment(), product).pipe(
      map(response => this.cast(response.data))
    );
  }

  updateProduct(id: number, product: ProductRequest): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(`${this.getUrlSegment()}/${id}`, product, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(
      map(response => this.cast(response.data))
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.delete(id);
  }

  searchProducts(query: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<Product>> {
    if (!query?.trim()) return of(this.emptyPage());

    return this.http.get<ApiResponse<PaginatedResponse<Product>>>(`${this.getUrlSegment()}/search`, {
      params: new HttpParams()
        .set('storeId', this.getStoreId())
        .set('query', query.trim())
        .set('page', page)
        .set('size', size)
    }).pipe(
      map(response => {
        const page = response.data;
        return { ...page, content: page.content.map(item => this.cast(item)) };
      }),
      catchError(() => of(this.emptyPage()))
    );
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(`${this.getUrlSegment()}/low-stock`, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(
      map(response => (response.data || []).map(item => this.cast(item))),
      catchError(() => of([]))
    );
  }

  searchByBarcode(barcode: string): Observable<Product | null> {
    return this.http.get<ApiResponse<Product[]>>(`${this.getUrlSegment()}/search`, {
      params: new HttpParams().set('storeId', this.getStoreId()).set('query', barcode)
    }).pipe(
      map(response => {
        const match = (response.data || []).find(p => p.barcode === barcode);
        return match ? this.cast(match) : null;
      }),
      catchError(() => of(null))
    );
  }

  private emptyPage(): PaginatedResponse<Product> {
    return { content: [], totalPages: 0, totalElements: 0, size: 0, number: 0, first: true, last: true, empty: true };
  }
}
