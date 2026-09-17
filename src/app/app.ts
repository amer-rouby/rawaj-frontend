import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl:"./app.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('rawaj-supermarket-frontend');

  private readonly translate = inject(TranslateService);
  // Injected here (not lazily in a feature component) so the color theme
  // applies to body before the very first paint - including the login
  // page, which renders before any authenticated feature does.
  private readonly themeService = inject(ThemeService);
  readonly direction = signal<'rtl' | 'ltr'>('rtl');
  readonly currentLang = signal<string>('ar');

  ngOnInit(): void {
    const lang = localStorage.getItem('language') || 'ar';
    this.setDirection(lang);
    this.translate.onLangChange.subscribe((event) => {
      this.setDirection(event.lang);
    });
  }

  private setDirection(lang: string): void {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.direction.set(dir);
    this.currentLang.set(lang);
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }
}
