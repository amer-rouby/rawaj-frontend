import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorConfig {
  duration?: number;
  panelClass?: string[];
  params?: any;
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  private readonly defaultConfig: ErrorConfig = {
    duration: 3000,
    panelClass: ['error-snackbar']
  };

  handleHttpError(error: HttpErrorResponse, fallbackKey: string = 'COMMON.ERROR'): void {
    // A backend error migrated to LocalizedException carries a stable `code` (+
    // interpolation `params`) the server resolves through ERRORS.<code> - prefer
    // that over the generic status-based fallback so the user sees the actual
    // reason (translated) instead of a generic "something went wrong".
    const code = error.error?.code;
    if (code) {
      const key = `ERRORS.${code}`;
      const translated = this.translate.instant(key, error.error?.params);
      if (translated !== key) {
        this.show(key, { ...this.defaultConfig, params: error.error?.params });
        return;
      }
    }

    let messageKey = fallbackKey;

    switch (error.status) {
      case 0:
        messageKey = 'ERRORS.CONNECTION';
        break;
      case 401:
        messageKey = 'ERRORS.UNAUTHORIZED';
        break;
      case 403:
        messageKey = 'ERRORS.FORBIDDEN';
        break;
      case 404:
        messageKey = 'ERRORS.NOT_FOUND';
        break;
      case 500:
        messageKey = 'ERRORS.SERVER';
        break;
      default:
        messageKey = fallbackKey;
    }

    this.show(messageKey, this.defaultConfig);
  }

  show(messageKey: string, config?: ErrorConfig): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const message = this.translate.instant(messageKey, finalConfig.params);

    this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), {
      duration: finalConfig.duration,
      panelClass: finalConfig.panelClass
    });
  }

  showSuccess(messageKey: string, config?: ErrorConfig): void {
    this.show(messageKey, {
      ...this.defaultConfig,
      ...config,
      panelClass: ['success-snackbar']
    });
  }

  showError(messageKey: string, config?: ErrorConfig): void {
    this.show(messageKey, {
      ...this.defaultConfig,
      ...config,
      panelClass: ['error-snackbar']
    });
  }

  showWarning(messageKey: string, config?: ErrorConfig): void {
    this.show(messageKey, {
      ...this.defaultConfig,
      ...config,
      panelClass: ['warning-snackbar']
    });
  }
}
