import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../shared/material.module';
import { ModelDialog } from '../../../core/abstracts/model-dialog';
import { User, UserRole } from '../../../core/models/user.model';
import { UserFormContract } from '../../../core/models/user-form.contract';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './user-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-dialog.component.scss'
})
export class UserDialogComponent extends ModelDialog<User, UserFormContract> {
  form!: FormGroup<UserFormContract>;
  successKey = this.isCreate() ? 'USERS.ADD_SUCCESS' : 'USERS.UPDATE_SUCCESS';
  errorKey = 'USERS.ERROR';

  readonly userRoles = [
    { value: UserRole.ADMIN, label: 'USERS.ADMIN' },
    { value: UserRole.PHARMACIST, label: 'USERS.PHARMACIST' },
    { value: UserRole.MANAGER, label: 'USERS.MANAGER' },
    { value: UserRole.VIEWER, label: 'USERS.VIEWER' }
  ];

  buildForm(): void {
    this.form = this.fb.group<UserFormContract>(
      this.model().buildFormControls() as unknown as UserFormContract
    );
  }

  prepareModel(): User {
    const value = this.form.getRawValue();
    return new User({
      ...this.model(),
      ...value,
      password: value.password?.trim() || undefined
    });
  }
}
