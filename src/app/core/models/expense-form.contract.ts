import { FormControl } from '@angular/forms';
import { ExpenseCategory } from './Expense.model';

export interface ExpenseFormContract {
  category: FormControl<ExpenseCategory>;
  title: FormControl<string>;
  description: FormControl<string | null>;
  amount: FormControl<number>;
  expenseDate: FormControl<Date>;
  paymentMethod: FormControl<string | null>;
  referenceNumber: FormControl<string | null>;
}
