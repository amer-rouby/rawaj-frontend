import { Component, inject, signal, computed, OnInit, OnDestroy, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { MaterialModule } from '../../material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationSettingsService } from '../../../core/services/settings/notification-settings.service';
import { LanguageService } from '../../../core/services/language.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AudioService } from '../../../core/services/audio.service';
import { NotificationModel } from '../../../core/models/Notification.model';
import { NotificationPanelComponent } from '../../../features/notification-bell/notification-panel/notification-panel.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MaterialModule,
    TranslateModule,
    NotificationPanelComponent
  ],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly notificationSettingsService = inject(NotificationSettingsService);
  private readonly audioService = inject(AudioService);
  private readonly translate = inject(TranslateService);
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly toggleSidebar = output<void>();
  readonly searchQuery = signal<string>('');
  readonly currentLang = signal<string>(this.languageService.getCurrentLanguage());
  readonly isDarkTheme = signal<boolean>(this.themeService.isDark());
  readonly notifications = signal<NotificationModel[]>([]);
  readonly totalCount = signal(0);
  readonly unreadCount = signal(0);
  readonly currentUser = toSignal(this.authService.currentUser$);

  private langSubscription?: Subscription;
  private themeSubscription?: Subscription;
  private notificationStreamSubscription?: Subscription;
  private lastUnreadCount = 0;

  readonly userDisplayName = computed(() => this.currentUser()?.fullName ?? 'مستخدم');
  readonly userDisplayRole = computed(() => this.currentUser()?.role ?? 'دور');
  readonly storeDisplayName = computed(() => this.currentUser()?.storeName?.trim() ?? '');

  hasAccess(roles?: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    const userRole = this.currentUser()?.role;
    if (!userRole) {
      return false;
    }
    return roles.includes(userRole);
  }

  readonly quickActions = [
    { route: '/products/new', icon: 'inventory_2', label: 'NAV.PRODUCTS_ADD', color: 'primary' },
    { route: '/sales/pos', icon: 'point_of_sale', label: 'NAV.SALES_POS', color: 'accent' },
    { route: '/stock/alerts', icon: 'adjust', label: 'NAV.STOCK_ALERTS', color: 'warn' }
  ];

  ngOnInit(): void {
    this.initLanguage();
    this.loadNotifications();
    this.setupNotificationStream();
    // Populates notificationSettingsService.settings() for alertNewNotification()
    // to read live - no local caching, so a change saved on the settings screen
    // takes effect immediately instead of only after this component reloads.
    this.notificationSettingsService.getSettings().subscribe();

    this.langSubscription = this.languageService.currentLang$.subscribe(lang => {
      this.currentLang.set(lang);
      // Already-fetched notifications were mapped to title/message in the previous
      // language - refetch so the bell picks up the new one immediately instead of
      // waiting for the next natural reload.
      this.loadNotifications();
    });

    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkTheme.set(theme === 'dark');
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  loadNotifications(playSoundOnIncrease = false): void {
    this.notificationService.getNotifications(0, 100).subscribe({
      next: (response) => {
        const list = response.content || [];
        const currentUnread = list.filter(n => !n.read).length;

        if (playSoundOnIncrease && currentUnread > this.lastUnreadCount && this.lastUnreadCount !== 0) {
          this.alertNewNotification();
        }

        this.lastUnreadCount = currentUnread;
        this.notifications.set([...list]);
        this.totalCount.set(response.totalElements || 0);
        this.unreadCount.set(currentUnread);
      },
      error: () => {
        this.notifications.set([]);
        this.unreadCount.set(0);
      }
    });
  }

  private initLanguage(): void {
    const lang = this.languageService.getCurrentLanguage() as 'ar' | 'en';
    this.currentLang.set(lang);
  }

  private alertNewNotification(): void {
    // Read live from the shared signal (not a locally cached copy) so a
    // preference saved on the settings screen takes effect on the very next
    // notification, not just after this component reloads.
    const settings = this.notificationSettingsService.settings();
    if (settings?.soundEnabled ?? true) {
      this.audioService.playNotificationSound();
    }
    if ((settings?.vibrationEnabled ?? true) && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }

  private setupNotificationStream(): void {
    // Every event (including 'notification-created') re-fetches via
    // loadNotifications() rather than appending the raw pushed payload -
    // that REST call filters by the user's own per-type notifyX settings
    // (getUserNotifications on the backend), which a same-store SSE broadcast
    // does not. Appending the raw payload directly used to show/alert for
    // notification types (e.g. "new sale") the user had explicitly disabled.
    this.notificationStreamSubscription = this.notificationService.connectToNotificationStream()
      .subscribe(event => {
        if (event.type === 'connected') {
          return;
        }
        this.loadNotifications(true);
      });
  }

  onSearch(): void {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { q: query } });
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.clearSearch();
  }

  onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.loadNotifications();
    });
  }

  onNotificationClick(notification: NotificationModel): void {
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  onViewAllNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  changeLanguage(lang: 'ar' | 'en'): void {
    this.languageService.setLanguage(lang);
    this.currentLang.set(lang);
  }

  toggleLanguage(): void {
    this.changeLanguage(this.currentLang() === 'ar' ? 'en' : 'ar');
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  ngOnDestroy(): void {
    this.langSubscription?.unsubscribe();
    this.themeSubscription?.unsubscribe();
    this.notificationStreamSubscription?.unsubscribe();
  }
}
