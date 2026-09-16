import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';
import { HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { CrudServiceWithDialog } from '../abstracts/crud-service-with-dialog';
import { Category } from '../models/category';
import { ApiResponse } from '../models';
import { environment } from '../../../environments/environment';
import { CategoryDialogComponent } from '../../features/products/category-dialog/category-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends CrudServiceWithDialog<CategoryDialogComponent, Category> {
  protected getUrlSegment(): string {
    return `${environment.apiUrl}/categories`;
  }

  protected createNewInstance(): Category {
    return new Category({ storeId: this.getStoreId(), isActive: true });
  }

  getDialogComponent(): ComponentType<CategoryDialogComponent> {
    return CategoryDialogComponent;
  }

  protected override afterCast(model: Category): void {
    model.nameAr ??= model.name;
    model.nameEn ??= model.name;
  }

  /** Used by product screens to populate a category dropdown - not part of the CRUD table. */
  getActiveCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(`${this.getUrlSegment()}/active`, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(
      map(response => (response.data || []).map(item => this.cast(item))),
      catchError(() => of([]))
    );
  }
}
