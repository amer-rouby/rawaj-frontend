import { computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, finalize, map, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ApiResponse, PaginatedResponse } from '../models';
import { CrudModel } from './crud-model';
import { registerCrudService } from './crud-service-registry';

/**
 * Generic per-store-scoped CRUD service. Every request carries the current store's id
 * (this app is multi-tenant by store), and every response is cast into a real Model
 * instance (not a plain object) via cast() so model.save()/delete() work directly.
 */
export abstract class CrudService<Model extends CrudModel<Model> & { id: number }> {
  protected readonly http = inject(HttpClient);
  protected readonly authService = inject(AuthService);

  protected abstract getUrlSegment(): string;
  /** Build a blank model instance (defaults only) - getNewInstance() also registers it. */
  protected abstract createNewInstance(): Model;

  paginatedItems = signal<PaginatedResponse<Model> | undefined>(undefined);
  items = computed(() => this.paginatedItems()?.content ?? []);
  isLoading = signal(false);

  /** A blank model ready to call .save() on. */
  getNewInstance(): Model {
    const model = this.createNewInstance();
    this.ensureRegistered(model);
    return model;
  }

  protected getStoreId(): number {
    return this.authService.getStoreId() ?? 1;
  }

  /** Casts a raw JSON object into a real Model instance. */
  protected cast(raw: object): Model {
    const model = Object.assign(this.createNewInstance(), raw) as Model;
    this.ensureRegistered(model);
    this.afterCast(model);
    return model;
  }

  private registered = false;
  private ensureRegistered(model: Model): void {
    if (this.registered) return;
    registerCrudService(model.constructor as new (...args: never[]) => Model, this);
    this.registered = true;
  }

  /** Override to decorate a freshly-cast model - the one hook every entity gets for free. */
  protected afterCast(model: Model): void {
    /* no-op by default */
    void model;
  }

  private castPage(page: PaginatedResponse<Model>): PaginatedResponse<Model> {
    return { ...page, content: page.content.map(item => this.cast(item)) };
  }

  load(page = 0, size = 10, search?: string): Observable<PaginatedResponse<Model>> {
    this.isLoading.set(true);
    let params = new HttpParams()
      .set('storeId', this.getStoreId())
      .set('page', page)
      .set('size', size);
    if (search?.trim()) params = params.set('search', search.trim());

    return this.http.get<ApiResponse<PaginatedResponse<Model>>>(`${this.getUrlSegment()}/page`, { params }).pipe(
      map(response => this.castPage(response.data)),
      tap(result => this.paginatedItems.set(result)),
      finalize(() => this.isLoading.set(false))
    );
  }

  loadById(id: number): Observable<Model> {
    return this.http.get<ApiResponse<Model>>(`${this.getUrlSegment()}/${id}`, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(map(response => this.cast(response.data)));
  }

  /**
   * Shapes the model into what the backend's create/update DTO actually accepts - server-managed
   * fields (id, timestamps) aren't part of those request bodies and most endpoints reject unknown
   * JSON fields outright. Override when an entity's request DTO excludes more than these three.
   */
  protected toPayload(item: Model): object {
    const { id, createdAt, updatedAt, ...rest } = item as unknown as Record<string, unknown>;
    void id; void createdAt; void updatedAt;
    return rest;
  }

  create(item: Model): Observable<Model> {
    this.isLoading.set(true);
    return this.http.post<ApiResponse<Model>>(this.getUrlSegment(), this.toPayload(item)).pipe(
      map(response => this.cast(response.data)),
      tap(created => this.prependToPaginatedItems(created)),
      finalize(() => this.isLoading.set(false))
    );
  }

  update(item: Model): Observable<Model> {
    this.isLoading.set(true);
    return this.http.put<ApiResponse<Model>>(`${this.getUrlSegment()}/${item.id}`, this.toPayload(item), {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(
      map(response => this.cast(response.data)),
      tap(updated => this.replaceInPaginatedItems(updated)),
      finalize(() => this.isLoading.set(false))
    );
  }

  delete(id: number): Observable<void> {
    this.isLoading.set(true);
    return this.http.delete<void>(`${this.getUrlSegment()}/${id}`, {
      params: new HttpParams().set('storeId', this.getStoreId())
    }).pipe(
      tap(() => this.removeFromPaginatedItems(id)),
      finalize(() => this.isLoading.set(false))
    );
  }

  private prependToPaginatedItems(model: Model): void {
    this.paginatedItems.update(state => {
      if (!state) return state;
      return { ...state, content: [model, ...state.content], totalElements: state.totalElements + 1 };
    });
  }

  private replaceInPaginatedItems(model: Model): void {
    this.paginatedItems.update(state => {
      if (!state) return state;
      return { ...state, content: state.content.map(item => item.id === model.id ? model : item) };
    });
  }

  private removeFromPaginatedItems(id: number): void {
    this.paginatedItems.update(state => {
      if (!state) return state;
      return {
        ...state,
        content: state.content.filter(item => item.id !== id),
        totalElements: state.totalElements - 1
      };
    });
  }
}
