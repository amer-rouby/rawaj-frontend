import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material.module';
import { ModelDialog } from '../../../core/abstracts/model-dialog';
import { Category } from '../../../core/models/category';
import { CategoryFormContract } from '../../../core/models/category-form.contract';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './category-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './category-dialog.component.scss'
})
export class CategoryDialogComponent extends ModelDialog<Category, CategoryFormContract> {
  form!: FormGroup<CategoryFormContract>;
  successKey = this.isCreate() ? 'CATEGORIES.ADD_SUCCESS' : 'CATEGORIES.UPDATE_SUCCESS';
  errorKey = this.isCreate() ? 'CATEGORIES.ADD_ERROR' : 'CATEGORIES.UPDATE_ERROR';

  buildForm(): void {
    this.form = this.fb.group<CategoryFormContract>(
      this.model().buildFormControls() as unknown as CategoryFormContract
    );
  }

  prepareModel(): Category {
    return new Category({
      ...this.model(),
      ...this.form.getRawValue(),
      nameAr: this.form.getRawValue().name,
      nameEn: this.form.getRawValue().name
    });
  }
}
