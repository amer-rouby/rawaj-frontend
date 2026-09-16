import { computed, DestroyRef, Directive, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EMPTY, exhaustMap, Subject, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorHandlerService } from '../services/error-handler.service';
import { CrudModel } from './crud-model';
import { DialogDataContract } from './dialog-data.model';
import { Operations } from './operations.enum';

/**
 * Base for every create/edit dialog. Subclasses only implement buildForm() and
 * prepareModel() - validation, save, success/error toasts, and closing the dialog
 * with the saved model are all handled here once.
 */
@Directive()
export abstract class ModelDialog<
  Model extends CrudModel<Model> & { id: number },
  FormGroupContract extends { [K in keyof FormGroupContract]: FormGroupContract[K] }
> implements OnInit {
  protected readonly fb = inject(FormBuilder);
  protected readonly errorHandler = inject(ErrorHandlerService);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly ref: MatDialogRef<unknown, unknown> = inject(MatDialogRef);
  readonly data: DialogDataContract<Model> = inject(MAT_DIALOG_DATA);

  readonly model: WritableSignal<Model> = signal(this.data.model);
  readonly isCreate: Signal<boolean> = computed(() => this.data.operation === Operations.CREATE);
  readonly loading = signal(false);

  readonly save$ = new Subject<void>();
  abstract form: FormGroup<FormGroupContract>;
  /** Translation keys for the save-result toast. */
  abstract successKey: string;
  abstract errorKey: string;

  abstract buildForm(): void;
  /** Build the model instance to persist from the current form value. */
  abstract prepareModel(): Model;

  ngOnInit(): void {
    this.buildForm();
    this.listenToSave();
  }

  onSubmit(): void {
    if (this.loading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.save$.next();
  }

  private listenToSave(): void {
    this.save$
      .pipe(
        tap(() => this.loading.set(true)),
        exhaustMap(() =>
          this.prepareModel()
            .save()
            .pipe(
              catchError(error => {
                this.loading.set(false);
                this.errorHandler.handleHttpError(error, this.errorKey);
                return EMPTY;
              })
            )
        ),
        tap(savedModel => {
          this.loading.set(false);
          this.errorHandler.showSuccess(this.successKey);
          this.ref.close(savedModel);
        })
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
