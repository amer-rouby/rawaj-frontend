import { Observable } from 'rxjs';

/** The minimal shape CrudModel needs from a service - avoids a circular generic constraint with CrudService itself. */
export interface CrudServiceContract<Model> {
  create(item: Model): Observable<Model>;
  update(item: Model): Observable<Model>;
  delete(id: number): Observable<void>;
}
