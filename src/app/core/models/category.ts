import { Validators } from '@angular/forms';
import { CrudModel } from '../abstracts/crud-model';

export class Category extends CrudModel<Category> {
  declare name: string;
  declare nameAr?: string;
  declare nameEn?: string;
  declare description?: string | null;
  declare icon?: string;
  declare color?: string;
  declare isActive: boolean;
  declare storeId: number;
  declare createdAt: string;
  declare updatedAt?: string;

  constructor(init?: Partial<Category>) {
    super();
    Object.assign(this, init);
  }

  buildFormControls(): object {
    return {
      name: [this.name ?? '', [Validators.required, Validators.minLength(2)]],
      description: [this.description ?? ''],
      icon: [this.icon ?? 'category'],
      color: [this.color ?? '#667eea'],
      isActive: [this.isActive ?? true]
    };
  }
}
