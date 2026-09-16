import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { TableLoadingComponent } from '../../shared/components/table-loading/table-loading.component';
import { MaterialModule } from '../../shared/material.module';
import { UserService } from '../../core/services/user.service';
import { User, UserRole } from '../../core/models/user.model';
import { ViewComponent } from '../../core/abstracts/view-component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent, FormsModule, EmptyStateComponent, TableLoadingComponent],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users.component.scss'
})
export class UsersComponent extends ViewComponent<User, UserService> {
  private readonly translate = inject(TranslateService);

  service = inject(UserService);
  displayedColumns = ['fullName', 'email', 'role', 'isActive', 'lastLoginAt', 'actions'];
  loadErrorKey = 'USERS.LOAD_ERROR';
  deleteConfirmKey = 'USERS.CONFIRM_DELETE';
  deleteSuccessKey = 'USERS.DELETE_SUCCESS';
  deleteErrorKey = 'USERS.DELETE_ERROR';

  readonly users = this.items;

  readonly userRoles = [
    { value: UserRole.ADMIN, label: 'USERS.ADMIN' },
    { value: UserRole.CASHIER, label: 'USERS.CASHIER' },
    { value: UserRole.MANAGER, label: 'USERS.MANAGER' },
    { value: UserRole.VIEWER, label: 'USERS.VIEWER' }
  ];

  protected override getDeleteConfirmParams(model: User): Record<string, unknown> {
    return { name: model.fullName };
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMIN]: this.translate.instant('USERS.ADMIN'),
      [UserRole.CASHIER]: this.translate.instant('USERS.CASHIER'),
      [UserRole.MANAGER]: this.translate.instant('USERS.MANAGER'),
      [UserRole.VIEWER]: this.translate.instant('USERS.VIEWER')
    };
    return labels[role] || role;
  }

  getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      [UserRole.ADMIN]: '#ef4444',
      [UserRole.CASHIER]: '#3b82f6',
      [UserRole.MANAGER]: '#f59e0b',
      [UserRole.VIEWER]: '#10b981'
    };
    return colors[role] || '#6b7280';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-EG-u-nu-latn', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
