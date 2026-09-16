import { FormControl } from '@angular/forms';
import { UserRole } from './user.model';

export interface UserFormContract {
  username: FormControl<string>;
  password: FormControl<string>;
  fullName: FormControl<string>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  role: FormControl<UserRole>;
  isActive: FormControl<boolean>;
}
