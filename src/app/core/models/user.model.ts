import { Validators } from '@angular/forms';
import { CrudModel } from '../abstracts/crud-model';

export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  VIEWER = 'VIEWER',
  MANAGER = 'MANAGER'
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  storeName: string;
  licenseNumber: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  fullName: string;
  storeId?: number | null;
}

export class User extends CrudModel<User> {
  declare storeId: number;
  declare storeName?: string;
  declare username: string;
  declare fullName: string;
  declare email?: string | null;
  declare phone?: string | null;
  declare role: UserRole;
  declare isActive: boolean;
  declare lastLoginAt?: string;
  declare createdAt: string;
  declare updatedAt?: string;
  /** Write-only - only ever sent to the server, never comes back in a response. */
  declare password?: string;

  constructor(init?: Partial<User>) {
    super();
    Object.assign(this, init);
  }

  buildFormControls(): object {
    const isEdit = !!this.id;
    return {
      username: [this.username ?? '', [Validators.required, Validators.minLength(3)]],
      password: ['', isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      fullName: [this.fullName ?? '', [Validators.required, Validators.minLength(2)]],
      email: [this.email ?? '', Validators.email],
      phone: [this.phone ?? ''],
      role: [this.role ?? UserRole.CASHIER, Validators.required],
      isActive: [this.isActive ?? true]
    };
  }
}
