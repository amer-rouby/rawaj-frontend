import { Injectable, inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CrudServiceWithDialog } from '../abstracts/crud-service-with-dialog';
import { Expense, ExpenseCategory, ExpenseSummary } from '../models/Expense.model';
import { ApiResponse } from '../models';
import { environment } from '../../../environments/environment';
import { AddExpenseDialogComponent } from '../../features/expenses/add-expense-dialog/add-expense-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService extends CrudServiceWithDialog<AddExpenseDialogComponent, Expense> {
  private readonly translate = inject(TranslateService);

  protected getUrlSegment(): string {
    return `${environment.apiUrl}/expenses`;
  }

  protected override getPageUrlSegment(): string {
    return this.getUrlSegment();
  }

  protected createNewInstance(): Expense {
    return new Expense({
      storeId: this.getStoreId(),
      category: 'PURCHASES',
      expenseDate: new Date().toISOString()
    });
  }

  getDialogComponent(): ComponentType<AddExpenseDialogComponent> {
    return AddExpenseDialogComponent;
  }

  protected override afterCast(model: Expense): void {
    const raw = model as unknown as { categoryArabic?: string };
    model.categoryAr = raw.categoryArabic || model.category;
  }

  protected override toPayload(item: Expense): object {
    const payload = super.toPayload(item) as Record<string, unknown>;
    delete payload['categoryAr'];
    delete payload['categoryArabic'];
    delete payload['createdBy'];
    return payload;
  }

  getExpenseSummary(startDate?: string, endDate?: string): Observable<ExpenseSummary> {
    let params = new HttpParams().set('storeId', this.getStoreId());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<ExpenseSummary>>(`${this.getUrlSegment()}/summary`, { params }).pipe(
      map(response => response.data)
    );
  }

  getExpenseCategories(): { value: ExpenseCategory; label: string }[] {
    const categories: ExpenseCategory[] = [
      'PURCHASES', 'SALARIES', 'RENT', 'UTILITIES', 'MAINTENANCE',
      'MARKETING', 'INSURANCE', 'LICENSES', 'TRANSPORT', 'OTHER'
    ];

    return categories.map(value => ({
      value,
      label: this.translate.instant(`EXPENSES.CATEGORIES.${value}`)
    }));
  }

  getPaymentMethods(): { value: string; label: string }[] {
    const methods = ['CASH', 'VISA', 'INSTAPAY', 'BANK_TRANSFER', 'WALLET'];

    return methods.map(value => ({
      value,
      label: this.translate.instant(`COMMON.PAYMENT_METHODS.${value}`)
    }));
  }
}
