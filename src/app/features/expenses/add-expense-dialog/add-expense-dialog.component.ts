import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../shared/material.module';
import { ExpenseService } from '../../../core/services/expense.service';
import { ModelDialog } from '../../../core/abstracts/model-dialog';
import { Expense } from '../../../core/models/Expense.model';
import { ExpenseFormContract } from '../../../core/models/expense-form.contract';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-expense-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule
  ],
  templateUrl: './add-expense-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-expense-dialog.component.scss'
})
export class AddExpenseDialogComponent extends ModelDialog<Expense, ExpenseFormContract> implements OnInit, OnDestroy {
  private readonly expenseService = inject(ExpenseService);
  private readonly translate = inject(TranslateService);
  private langChangeSub?: Subscription;

  form!: FormGroup<ExpenseFormContract>;
  successKey = this.isCreate() ? 'EXPENSES.ADD_SUCCESS' : 'EXPENSES.UPDATE_SUCCESS';
  errorKey = this.isCreate() ? 'EXPENSES.ADD_ERROR' : 'EXPENSES.UPDATE_ERROR';

  categories: { value: string; label: string }[] = [];
  paymentMethods: { value: string; label: string }[] = [];

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadCategories();
    this.loadPaymentMethods();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.loadCategories();
      this.loadPaymentMethods();
    });
  }

  ngOnDestroy(): void {
    this.langChangeSub?.unsubscribe();
  }

  private loadCategories(): void {
    this.categories = this.expenseService.getExpenseCategories();
  }

  private loadPaymentMethods(): void {
    this.paymentMethods = this.expenseService.getPaymentMethods();
  }

  buildForm(): void {
    this.form = this.fb.group<ExpenseFormContract>(
      this.model().buildFormControls() as unknown as ExpenseFormContract
    );
  }

  prepareModel(): Expense {
    const value = this.form.getRawValue();
    return new Expense({
      ...this.model(),
      ...value,
      expenseDate: this.formatDateForApi(value.expenseDate)
    });
  }

  private formatDateForApi(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }
}
