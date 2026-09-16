import { Observable } from 'rxjs';
import { resolveCrudService } from './crud-service-registry';

/**
 * Base class every CRUD entity model extends. Gives create()/update()/delete()/save()
 * for free - the model looks up its own service by class via the registry (see
 * crud-service-registry.ts) instead of carrying a live reference, which would otherwise
 * break JSON.stringify(this) on save and object-spread cloning in dialogs.
 */
export abstract class CrudModel<Model extends { id: number }> {
  id!: number;

  abstract buildFormControls(): object;

  private get service() {
    return resolveCrudService<Model>(this.constructor as new (...args: never[]) => Model);
  }

  create(): Observable<Model> {
    return this.service.create(this as unknown as Model);
  }

  update(): Observable<Model> {
    return this.service.update(this as unknown as Model);
  }

  delete(): Observable<void> {
    return this.service.delete(this.id);
  }

  save(): Observable<Model> {
    return this.id ? this.update() : this.create();
  }

  /** Flips a boolean field (defaults to `isActive`) and saves immediately. */
  toggleStatus(activeField: keyof Model = 'isActive' as keyof Model): Observable<Model> {
    (this as unknown as Model)[activeField] = !(this as unknown as Model)[activeField] as never;
    return this.save();
  }
}
