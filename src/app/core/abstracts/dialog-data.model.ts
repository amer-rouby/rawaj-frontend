import { Operations } from './operations.enum';

export interface DialogDataContract<Model, Extras = object> {
  model: Model;
  operation: Operations;
  extras?: Extras;
}
