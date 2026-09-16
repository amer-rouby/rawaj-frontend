import { FormControl } from '@angular/forms';

export interface CategoryFormContract {
  name: FormControl<string>;
  description: FormControl<string | null>;
  icon: FormControl<string>;
  color: FormControl<string>;
  isActive: FormControl<boolean>;
}
