import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category';
import { ViewComponent } from '../../../core/abstracts/view-component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-categories',
  standalone: true,
  imports: [
    FormsModule,
    MaterialModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './product-categories.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-categories.component.scss'
})
export class ProductCategoriesComponent extends ViewComponent<Category, CategoryService> {
  private readonly translate = inject(TranslateService);

  service = inject(CategoryService);
  displayedColumns = ['icon', 'name', 'description', 'isActive', 'actions'];
  loadErrorKey = 'CATEGORIES.LOAD_ERROR';
  deleteConfirmKey = 'CATEGORIES.CONFIRM_DELETE';
  deleteSuccessKey = 'CATEGORIES.DELETE_SUCCESS';
  deleteErrorKey = 'CATEGORIES.DELETE_ERROR';

  readonly categories = this.items;

  getCategoryIcon(category: Category): string {
    return category.icon || 'category';
  }

  getCategoryColor(category: Category): string {
    return category.color || '#667eea';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive
      ? this.translate.instant('COMMON.ACTIVE')
      : this.translate.instant('COMMON.INACTIVE');
  }

  getStatusColor(isActive: boolean): 'primary' | 'warn' {
    return isActive ? 'primary' : 'warn';
  }
}
