import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { ThemeService } from './core/services/theme.service';
import { applyChartJsTheme } from './core/utils/chart-theme.util';

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
  private readonly swUpdate = inject(SwUpdate);
  readonly direction = signal<'rtl' | 'ltr'>('rtl');
  readonly currentLang = signal<string>('ar');

  constructor() {
    // currentTheme$ is a BehaviorSubject, so this also applies the theme
    // immediately (covers the initial load, not just later toggles).
    this.themeService.currentTheme$.subscribe(() => applyChartJsTheme());

    // The service worker only checks in the background - without this, an
    // already-open tab keeps serving whatever was cached at its own last
    // load indefinitely after a new deployment, until the user manually
    // clears site data. Activate and reload as soon as a new version is
    // ready so a redeploy actually reaches people without any manual step.
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          this.swUpdate.activateUpdate().then(() => document.location.reload());
        });
    }
  }

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

    // Angular Material's outlined form fields measure their notch/label
    // gap once against whatever direction was active at render time, and
    // don't re-measure just because `dir` changes later at runtime - every
    // already-rendered field (any screen the user had open before
    // switching language) is left with a stale, wrong-direction gap,
    // which is what actually causes the overlapping label/value look.
    // Material's own notch recalculation already listens for window
    // resize, so firing one is the standard way to force it everywhere
    // at once instead of hunting down every affected form field.
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }
}
