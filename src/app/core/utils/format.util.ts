// '-u-nu-latn' forces Western (0-9) digits under the Arabic locale - plain
// 'ar-EG' renders Eastern Arabic-Indic digits (٠١٢٣) in this ICU build, which
// reads as broken/foreign to an Egyptian user expecting the digits they
// actually use day to day.
export function formatCurrency(amount: number, lang: string, currency: string = 'EGP'): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDateTime(dateString: string, lang: string): string {
  return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
