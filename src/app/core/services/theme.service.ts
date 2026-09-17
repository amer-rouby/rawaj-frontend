import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

export type ColorTheme = 'gray' | 'emerald' | 'purple' | 'blue' | 'orange';

export const COLOR_THEMES: { value: ColorTheme; labelKey: string; descKey: string; swatch: string }[] = [
  { value: 'gray', labelKey: 'SETTINGS.THEME.GRAY', descKey: 'SETTINGS.THEME.GRAY_DESC', swatch: '#64748b' },
  { value: 'emerald', labelKey: 'SETTINGS.THEME.EMERALD', descKey: 'SETTINGS.THEME.EMERALD_DESC', swatch: '#059669' },
  { value: 'purple', labelKey: 'SETTINGS.THEME.PURPLE', descKey: 'SETTINGS.THEME.PURPLE_DESC', swatch: '#9333ea' },
  { value: 'blue', labelKey: 'SETTINGS.THEME.BLUE', descKey: 'SETTINGS.THEME.BLUE_DESC', swatch: '#2563eb' },
  { value: 'orange', labelKey: 'SETTINGS.THEME.ORANGE', descKey: 'SETTINGS.THEME.ORANGE_DESC', swatch: '#f97316' }
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
    return 'blue';
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    // v1.0.1 redesign ships dark-first - unlike before, a fresh install (no
    // saved preference yet) now defaults to dark regardless of OS preference.
    const themeToUse: ThemeMode = savedTheme ?? 'dark';
    this.setTheme(themeToUse);
  }

  private initializeColorTheme(): void {
    // Storage key bumped for the v1.0.1 redesign - the old 5 themes
    // (emerald/indigo/maroon/azure/amber) are gone, but "emerald" alone was
    // still a valid name in the new set, so a stale 'colorTheme' value would
    // have silently survived and hidden the new "blue" default. A fresh key
    // guarantees everyone actually lands on the new default once.
    const saved = localStorage.getItem('colorThemeV2') as ColorTheme | null;
    const isValid = saved && COLOR_THEMES.some(t => t.value === saved);
    this.setColorTheme(isValid ? saved : this.getDefaultColorTheme());
  }

  setColorTheme(theme: ColorTheme): void {
    document.body.classList.remove(...COLOR_THEMES.map(t => `theme-${t.value}`));
    document.body.classList.add(`theme-${theme}`);
    this.currentColorThemeSubject.next(theme);
    localStorage.setItem('colorThemeV2', theme);
  }

  getCurrentColorTheme(): ColorTheme {
    return this.currentColorThemeSubject.getValue();
  }

  setTheme(theme: ThemeMode): void {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    document.body.style.backgroundColor = theme === 'dark' ? '#0a1220' : '#f1f5f9';
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
