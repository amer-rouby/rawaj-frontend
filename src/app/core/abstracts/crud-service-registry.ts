import { CrudServiceContract } from './crud-service.contract';

type ModelCtor<T> = new (...args: never[]) => T;

/**
 * Maps a model class to the CrudService instance that owns it, so a model instance can call
 * save()/delete() without carrying a live service reference (which would break JSON.stringify
 * on save and object-spread cloning in dialogs - both real things models go through).
 */
const registry = new Map<ModelCtor<unknown>, CrudServiceContract<unknown>>();

export function registerCrudService<T>(modelCtor: ModelCtor<T>, service: CrudServiceContract<T>): void {
  if (!registry.has(modelCtor as ModelCtor<unknown>)) {
    registry.set(modelCtor as ModelCtor<unknown>, service as CrudServiceContract<unknown>);
  }
}

export function resolveCrudService<T>(modelCtor: ModelCtor<T>): CrudServiceContract<T> {
  const service = registry.get(modelCtor as ModelCtor<unknown>);
  if (!service) {
    throw new Error(`No CrudService registered for model "${modelCtor.name}" - it only registers once its service has created or cast at least one instance.`);
  }
  return service as CrudServiceContract<T>;
}
