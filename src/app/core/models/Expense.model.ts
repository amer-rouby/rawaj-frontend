import { Validators } from '@angular/forms';
import { CrudModel } from '../abstracts/crud-model';

export type ExpenseCategory =
  | 'PURCHASES'
  | 'SALARIES'
  | 'RENT'
  | 'UTILITIES'
  | 'MAINTENANCE'
  | 'MARKETING'
  | 'INSURANCE'
  | 'LICENSES'
  | 'TRANSPORT'
  | 'OTHER';

export class Expense extends CrudModel<Expense> {
  declare storeId: number;
  declare category: ExpenseCategory;
  declare categoryAr: string;
  declare title: string;
  declare description?: string | null;
  declare amount: number;
  declare expenseDate: string;
  declare paymentMethod?: string | null;
  declare referenceNumber?: string | null;
  declare attachmentUrl?: string;
  declare createdBy?: string;
  declare createdAt?: string;
  declare updatedAt?: string;

  constructor(init?: Partial<Expense>) {
    super();
    Object.assign(this, init);
  }

  buildFormControls(): object {
    return {
      category: [this.category ?? 'PURCHASES', Validators.required],
      title: [this.title ?? '', [Validators.required, Validators.maxLength(200)]],
      description: [this.description ?? '', Validators.maxLength(1000)],
      amount: [this.amount ?? 0, [Validators.required, Validators.min(0.01)]],
      expenseDate: [this.expenseDate ? new Date(this.expenseDate) : new Date(), Validators.required],
      paymentMethod: [this.paymentMethod ?? 'CASH'],
      referenceNumber: [this.referenceNumber ?? '', Validators.maxLength(100)]
    };
  }
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalTransactions: number;
  averageExpense: number;
  expensesByCategory: Array<{
    category: string;
    amount: number;
  }>;
  dailyExpenses: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  recentExpenses: Array<{
    id: number;
    title: string;
    category: ExpenseCategory;
    amount: number;
    expenseDate: string;
  }>;
}
