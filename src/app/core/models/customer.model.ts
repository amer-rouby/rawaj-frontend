import { Validators } from '@angular/forms';
import { CrudModel } from '../abstracts/crud-model';

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export class Customer extends CrudModel<Customer> {
  declare name: string;
  declare phone?: string;
  declare email?: string;
  declare creditLimit: number;
  declare currentBalance: number;
  declare availableCredit: number;
  declare status: CustomerStatus;
  declare notes?: string;
  declare storeId: number;
  declare createdAt: string;
  declare updatedAt: string;

  constructor(init?: Partial<Customer>) {
    super();
    Object.assign(this, init);
  }

  buildFormControls(): object {
    return {
      name: [this.name ?? '', Validators.required],
      phone: [this.phone ?? ''],
      email: [this.email ?? '', [Validators.email]],
      creditLimit: [this.creditLimit ?? 0],
      status: [this.status ?? 'ACTIVE'],
      notes: [this.notes ?? '']
    };
  }
}

export interface CustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  creditLimit?: number;
  status?: CustomerStatus;
  notes?: string;
}

export interface CustomerPaymentRequest {
  amount: number;
  notes?: string;
}

export type CustomerTransactionType = 'CREDIT_SALE' | 'PAYMENT';

export interface CustomerTransaction {
  id: number;
  type: CustomerTransactionType;
  amount: number;
  relatedSaleId?: number;
  balanceAfter: number;
  createdByName?: string;
  notes?: string;
  createdAt: string;
}

export interface CustomerStatement {
  customer: Customer;
  transactions: CustomerTransaction[];
}
