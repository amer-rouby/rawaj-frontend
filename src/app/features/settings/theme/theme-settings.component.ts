import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MaterialModule } from '../../../shared/material.module';
import { ThemeService, ThemeMode, ColorTheme, COLOR_THEMES } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [MaterialModule, PageHeaderComponent],
  templateUrl: './theme-settings.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './theme-settings.component.scss'
})
export class ThemeSettingsComponent {
  private readonly themeService = inject(ThemeService);

  readonly colorThemes = COLOR_THEMES;
  readonly mode = signal<ThemeMode>(this.themeService.getCurrentTheme());
  readonly colorTheme = signal<ColorTheme>(this.themeService.getCurrentColorTheme());

  constructor() {
    this.themeService.currentTheme$.subscribe(mode => this.mode.set(mode));
    this.themeService.currentColorTheme$.subscribe(theme => this.colorTheme.set(theme));
  }

  setMode(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
  }

  setColorTheme(theme: ColorTheme): void {
    this.themeService.setColorTheme(theme);
  }
}
