import { Validators } from '@angular/forms';
import { CrudModel } from '../abstracts/crud-model';

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export class Supplier extends CrudModel<Supplier> {
  declare name: string;
  declare contactPerson?: string;
  declare phone?: string;
  declare email?: string;
  declare address?: string;
  declare city?: string;
  declare status: SupplierStatus;
  declare notes?: string;
  declare storeId: number;
  declare createdAt: string;
  declare updatedAt: string;

  constructor(init?: Partial<Supplier>) {
    super();
    Object.assign(this, init);
  }

  buildFormControls(): object {
    return {
      name: [this.name ?? '', [Validators.required, Validators.minLength(2)]],
      contactPerson: [this.contactPerson ?? ''],
      phone: [this.phone ?? ''],
      email: [this.email ?? '', [Validators.email]],
      address: [this.address ?? ''],
      city: [this.city ?? ''],
      status: [this.status ?? 'ACTIVE'],
      notes: [this.notes ?? '']
    };
  }
}
