import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../shared/material.module';
import { ExpenseService } from '../../core/services/expense.service';
import { Expense } from '../../core/models/Expense.model';
import { ViewComponent } from '../../core/abstracts/view-component';
import { CurrencyService } from '../../core/services/currency.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MaterialModule,
    PageHeaderComponent
  ],
  templateUrl: './expenses.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent extends ViewComponent<Expense, ExpenseService> {
  private readonly currencyService = inject(CurrencyService);

  service = inject(ExpenseService);
  displayedColumns = ['category', 'title', 'amount', 'expenseDate', 'paymentMethod', 'actions'];
  loadErrorKey = 'EXPENSES.LOAD_ERROR';
  deleteConfirmKey = 'EXPENSES.DELETE_CONFIRM_MESSAGE';
  deleteSuccessKey = 'EXPENSES.DELETE_SUCCESS';
  deleteErrorKey = 'EXPENSES.DELETE_ERROR';

  // No paginator UI on this screen (matches the pre-migration behavior) - load a large single page.
  override readonly size = signal(50);
  readonly expenses = this.items;
  readonly totalExpenses = computed(() => this.items().reduce((sum, exp) => sum + exp.amount, 0));

  protected override getDeleteConfirmParams(): Record<string, unknown> {
    return {};
  }

  formatCurrency(amount: number): string {
    return this.currencyService.format(amount, 'ar');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-EG-u-nu-latn', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
