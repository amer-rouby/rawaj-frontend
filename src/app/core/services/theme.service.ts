import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ThemeMode = 'light' | 'dark';

export type ColorTheme = 'emerald' | 'indigo' | 'maroon' | 'azure' | 'amber';

export const COLOR_THEMES: { value: ColorTheme; labelKey: string; swatch: string }[] = [
  { value: 'emerald', labelKey: 'SETTINGS.THEME.EMERALD', swatch: '#059669' },
  { value: 'indigo', labelKey: 'SETTINGS.THEME.INDIGO', swatch: '#4f46e5' },
  { value: 'maroon', labelKey: 'SETTINGS.THEME.MAROON', swatch: '#800020' },
  { value: 'azure', labelKey: 'SETTINGS.THEME.AZURE', swatch: '#2563eb' },
  { value: 'amber', labelKey: 'SETTINGS.THEME.AMBER', swatch: '#9c6b0a' }
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly currentThemeSubject = new BehaviorSubject<ThemeMode>('light');
  readonly currentTheme$: Observable<ThemeMode> = this.currentThemeSubject.asObservable();

  private readonly currentColorThemeSubject = new BehaviorSubject<ColorTheme>(this.getDefaultColorTheme());
  readonly currentColorTheme$: Observable<ColorTheme> = this.currentColorThemeSubject.asObservable();

  constructor() {
    this.initializeTheme();
    this.initializeColorTheme();
  }

  private getDefaultColorTheme(): ColorTheme {
    const brand = (environment as { brand?: string }).brand;
    return brand === 'techShop' ? 'indigo' : 'emerald';
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const themeToUse: ThemeMode = savedTheme ?? (prefersDark ? 'dark' : 'light');
    this.setTheme(themeToUse);
  }

  private initializeColorTheme(): void {
    const saved = localStorage.getItem('colorTheme') as ColorTheme | null;
    const isValid = saved && COLOR_THEMES.some(t => t.value === saved);
    this.setColorTheme(isValid ? saved : this.getDefaultColorTheme());
  }

  setColorTheme(theme: ColorTheme): void {
    document.body.classList.remove(...COLOR_THEMES.map(t => `theme-${t.value}`));
    document.body.classList.add(`theme-${theme}`);
    this.currentColorThemeSubject.next(theme);
    localStorage.setItem('colorTheme', theme);
  }

  getCurrentColorTheme(): ColorTheme {
    return this.currentColorThemeSubject.getValue();
  }

  setTheme(theme: ThemeMode): void {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    document.body.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#f1f5f9';
    document.body.style.color = theme === 'dark' ? '#f1f5f9' : '#1e293b';
    this.currentThemeSubject.next(theme);
    localStorage.setItem('theme', theme);
  }

  toggleTheme(): void {
    this.setTheme(this.getCurrentTheme() === 'dark' ? 'light' : 'dark');
  }

  getCurrentTheme(): ThemeMode {
    return this.currentThemeSubject.getValue();
  }

  isDark(): boolean {
    return this.getCurrentTheme() === 'dark';
  }
}
