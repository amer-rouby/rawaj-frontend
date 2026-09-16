import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './language.service';
import { CurrencyService } from './currency.service';
import { AuthService } from './auth.service';
import { getPrintDocumentStyles, getPrintFooterHtml, getPrintLetterheadHtml } from './print-document.util';
import { PurchaseOrder } from '../models/purchase-order.model';

export interface PrintOptions {
  title: string;
  subtitle?: string;
  data: any[];
  columns: PrintColumn[];
  summary?: PrintSummary[];
  direction?: 'rtl' | 'ltr';
}

export interface PrintColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date';
  width?: string;
}

export interface PrintSummary {
  label: string;
  value: string | number;
  type?: 'text' | 'number' | 'currency';
}

@Injectable({
  providedIn: 'root'
})
export class PrintHelperService {
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly currencyService = inject(CurrencyService);
  private readonly authService = inject(AuthService);

  /**
   * Opens a print-ready window with the report data.
   * Uses browser's native print dialog - no download, no backend PDF.
   */
  printReport(options: PrintOptions): void {
    const isArabic = this.languageService.getCurrentLanguage() === 'ar';
    const dir = options.direction || (isArabic ? 'rtl' : 'ltr');
    const lang = isArabic ? 'ar' : 'en';

    const t = (key: string): string => {
      const val = this.translate.instant(key);
      return val && val !== key ? val : key;
    };

    const html = this.generatePrintHtml(options, t, isArabic, dir, lang);
    this.printHtml(html);
  }

  /**
   * Prints a purchase order via the same native print dialog (pick "Save as
   * PDF" as the destination) instead of generating the PDF on the server -
   * no backend round-trip, no server-side rendering dependency, and the
   * browser already shapes Arabic text correctly since it's the same engine
   * rendering every other screen of this app.
   */
  printPurchaseOrder(order: PurchaseOrder, supplierPhone?: string): void {
    const isArabic = this.languageService.getCurrentLanguage() === 'ar';
    const dir = isArabic ? 'rtl' : 'ltr';
    const lang = isArabic ? 'ar' : 'en';
    const t = (key: string): string => {
      const val = this.translate.instant(key);
      return val && val !== key ? val : key;
    };

    const storeInfo = this.authService.getStoreInfo();
    const storeName = storeInfo?.name || t('APP.NAME');

    const statusLabels: Record<string, string> = {
      DRAFT: t('PURCHASES.STATUS.DRAFT'),
      PENDING: t('PURCHASES.STATUS.PENDING'),
      APPROVED: t('PURCHASES.STATUS.APPROVED'),
      RECEIVED: t('PURCHASES.STATUS.RECEIVED'),
      CANCELLED: t('PURCHASES.STATUS.CANCELLED')
    };
    const priorityLabels: Record<string, string> = {
      LOW: t('PURCHASES.PRIORITY.LOW'),
      NORMAL: t('PURCHASES.PRIORITY.NORMAL'),
      URGENT: t('PURCHASES.PRIORITY.URGENT')
    };

    const currency = (value: number): string =>
      new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: this.currencyService.getCode(),
        minimumFractionDigits: 2
      }).format(value);

    const infoRows = [
      [t('COMMON.ORDER_NUMBER'), order.orderNumber, t('COMMON.DATE'), order.orderDate],
      [t('COMMON.SUPPLIER'), order.supplierName, t('COMMON.STATUS'), statusLabels[order.status] || order.status],
      [
        order.expectedDeliveryDate ? t('COMMON.EXPECTED_DELIVERY') : t('COMMON.PRIORITY'),
        order.expectedDeliveryDate || priorityLabels[order.priority] || order.priority,
        order.paymentTerms ? t('PURCHASES.PAYMENT_TERMS') : t('COMMON.PRIORITY'),
        order.paymentTerms || priorityLabels[order.priority] || order.priority
      ]
    ];

    const infoTableHtml = `
      <table class="info-table"><tbody>
        ${infoRows.map(([l1, v1, l2, v2]) => `
          <tr>
            <td class="info-label">${l1}</td><td class="info-value">${v1}</td>
            <td class="info-label">${l2}</td><td class="info-value">${v2}</td>
          </tr>
        `).join('')}
      </tbody></table>
    `;

    const itemsHtml = `
      <table class="data-table"><thead><tr>
        <th>#</th>
        <th>${t('COMMON.PRODUCT')}</th>
        <th>${t('COMMON.QUANTITY')}</th>
        <th>${t('COMMON.UNIT_PRICE')}</th>
        <th>${t('COMMON.TOTAL')}</th>
      </tr></thead><tbody>
        ${order.items.map((item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>${currency(item.unitPrice)}</td>
            <td>${currency(item.totalPrice)}</td>
          </tr>
        `).join('')}
      </tbody></table>
    `;

    const generatedMeta = `${t('REPORTS.GENERATED') || 'Generated'}: ${new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

    const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${order.orderNumber}</title>
  <style>
    ${getPrintDocumentStyles(isArabic)}
    .info-table { margin-bottom: 18px; }
    .info-table td { border-bottom: 1px solid #cbd5e1; }
    .info-label { font-size: 10px; font-weight: 700; color: #64748b; white-space: nowrap; width: 1%; padding-inline-end: 8px; }
    .info-value { font-size: 12px; font-weight: 700; padding-inline-end: 20px; }
    .totals { margin-top: 16px; text-align: ${isArabic ? 'left' : 'right'}; }
    .totals-inner { display: inline-block; min-width: 260px; border-top: 2px solid #047857; padding-top: 8px; }
    .totals-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; }
    .totals-row .amount { color: #047857; }
  </style>
</head>
<body>
  <div class="print-doc">
    ${getPrintLetterheadHtml({ name: storeName }, t('PURCHASES.DETAILS'), undefined, generatedMeta)}
    ${infoTableHtml}
    ${itemsHtml}
    <div class="totals"><div class="totals-inner"><div class="totals-row">
      <span>${t('PURCHASES.ORDER_TOTAL')}</span><span class="amount">${currency(order.totalAmount)}</span>
    </div></div></div>
    ${getPrintFooterHtml(t('APP.NAME'), t('REPORTS.GENERATED') || 'Generated', isArabic)}
  </div>
</body>
</html>`;

    this.printHtml(html);
  }

  private printHtml(html: string): void {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 100);
        }, 300);
      };
    }
  }

  private generatePrintHtml(
    options: PrintOptions,
    t: (key: string) => string,
    isArabic: boolean,
    dir: string,
    lang: string
  ): string {
    const summaryHtml = options.summary?.length ? `
      <div class="summary-section">
        <div class="summary-grid">
          ${options.summary.map(item => `
            <div class="summary-item">
              <div class="summary-label">${item.label}</div>
              <div class="summary-value">${this.formatValue(item.value, item.type || 'text', isArabic)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const tableHtml = options.data.length > 0 ? `
      <table class="data-table">
        <thead>
          <tr>
            ${options.columns.map(col => `
              <th style="${col.width ? `width: ${col.width}` : ''}">${col.label}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${options.data.map(row => `
            <tr>
              ${options.columns.map(col => `
                <td>${this.formatValue(row[col.key], col.type || 'text', isArabic)}</td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : `
      <div class="no-data">
        <p>${t('REPORTS.NO_DATA') || 'No data available'}</p>
      </div>
    `;

    const storeName = this.authService.getStoreInfo()?.name || t('APP.NAME');
    const generatedMeta = `${t('REPORTS.GENERATED') || 'Generated'}: ${new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

    return `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${options.title}</title>
  <style>
    ${getPrintDocumentStyles(isArabic)}
    .summary-section { margin-bottom: 20px; }
    .summary-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
    .summary-item {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
      padding: 10px 16px; min-width: 130px; text-align: center;
    }
    .summary-label { font-size: 10px; color: #64748b; margin-bottom: 4px; }
    .summary-value { font-size: 15px; font-weight: 700; color: #1e293b; }
    .no-data { text-align: center; padding: 40px; color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="print-doc">
    ${getPrintLetterheadHtml({ name: storeName }, options.title, options.subtitle, generatedMeta)}
    ${summaryHtml}
    ${tableHtml}
    ${getPrintFooterHtml(t('APP.NAME'), t('REPORTS.GENERATED') || 'Generated', isArabic)}
  </div>
</body>
</html>`;
  }

  private formatValue(value: any, type: string, isArabic: boolean): string {
    if (value === null || value === undefined) return '-';

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US', {
          style: 'currency',
          currency: this.currencyService.getCode(),
          minimumFractionDigits: 2
        }).format(value);

      case 'number':
        return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(value);

      case 'date':
        try {
          return new Date(value).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
        } catch {
          return value;
        }

      default:
        return value;
    }
  }
}
