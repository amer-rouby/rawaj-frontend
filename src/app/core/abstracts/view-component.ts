import { computed, DestroyRef, Directive, inject, OnInit, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { EMPTY, Subject, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorHandlerService } from '../services/error-handler.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { CrudModel } from './crud-model';
import { CrudServiceWithDialog } from './crud-service-with-dialog';

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Base for every list/table screen. Handles paginate/search/reload plumbing plus the
 * standard add/edit/delete/toggle-status flows against the screen's service+dialog -
 * subclasses only set `service`, `displayedColumns`, and the toast translation keys.
 */
@Directive()
export abstract class ViewComponent<
  Model extends CrudModel<Model> & { id: number },
  Service extends CrudServiceWithDialog<unknown, Model>
> implements OnInit {
  abstract service: Service;
  abstract displayedColumns: string[];
  abstract loadErrorKey: string;
  abstract deleteConfirmKey: string;
  abstract deleteSuccessKey: string;
  abstract deleteErrorKey: string;

  protected readonly errorHandler = inject(ErrorHandlerService);
  protected readonly confirmDialog = inject(ConfirmDialogService);
  protected readonly destroyRef = inject(DestroyRef);

  readonly page = signal(0);
  readonly size = signal(10);
  readonly searchQuery = signal('');
  readonly items = computed(() => this.service.items());
  readonly totalElements = computed(() => this.service.paginatedItems()?.totalElements ?? 0);
  readonly hasPagination = computed(() => this.totalElements() > this.size());
  readonly loading = computed(() => this.service.isLoading());

  readonly reload$ = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(0);
        this.reload$.next();
      });

    this.reload$
      .pipe(
        switchMap(() =>
          this.service.load(this.page(), this.size(), this.searchQuery()).pipe(
            catchError(error => {
              this.errorHandler.handleHttpError(error, this.loadErrorKey);
              return EMPTY;
            })
          )
        )
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();

    this.reload$.next();
  }

  refresh(): void {
    this.reload$.next();
  }

  onSearchInput(): void {
    this.searchInput$.next(this.searchQuery());
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.page.set(0);
    this.reload$.next();
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.size.set(event.pageSize);
    this.reload$.next();
  }

  onAdd(): void {
    this.service.openCreateDialog().afterClosed().subscribe(result => {
      if (result) this.reload$.next();
    });
  }

  onEdit(model: Model): void {
    this.service.openEditDialog(model).afterClosed().subscribe(result => {
      if (result) this.reload$.next();
    });
  }

  /** Override when the confirm message interpolates something other than `{{name}}`. */
  protected getDeleteConfirmParams(model: Model): Record<string, unknown> {
    return { name: (model as never)['name'] };
  }

  onDelete(model: Model): void {
    this.confirmDialog.confirmDelete(this.deleteConfirmKey, this.getDeleteConfirmParams(model)).subscribe(confirmed => {
      if (!confirmed) return;
      model.delete().subscribe({
        next: () => {
          this.errorHandler.showSuccess(this.deleteSuccessKey);
          this.reload$.next();
        },
        error: error => this.errorHandler.handleHttpError(error, this.deleteErrorKey)
      });
    });
  }

  toggleActive(model: Model, activeField: keyof Model = 'isActive' as keyof Model): void {
    const flags = model as unknown as Record<string, boolean>;
    const field = activeField as string;
    model.toggleStatus(activeField).pipe(
      tap({ error: () => (flags[field] = !flags[field]) })
    ).subscribe({
      error: error => this.errorHandler.handleHttpError(error, 'COMMON.ERROR')
    });
  }
}
