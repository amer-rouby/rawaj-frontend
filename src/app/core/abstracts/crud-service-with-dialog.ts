import { inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/overlay';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { CrudModel } from './crud-model';
import { CrudService } from './crud-service';
import { DialogDataContract } from './dialog-data.model';
import { Operations } from './operations.enum';

export abstract class CrudServiceWithDialog<DialogComponent, Model extends CrudModel<Model> & { id: number }>
  extends CrudService<Model> {
  protected readonly dialog = inject(MatDialog);

  abstract getDialogComponent(): ComponentType<DialogComponent>;

  openCreateDialog<R = unknown>(configs?: MatDialogConfig, extras?: object): MatDialogRef<DialogComponent, R> {
    return this.dialog.open<DialogComponent, DialogDataContract<Model>, R>(this.getDialogComponent(), {
      width: '560px',
      maxWidth: '92vw',
      ...configs,
      data: { model: this.getNewInstance(), operation: Operations.CREATE, extras }
    });
  }

  openEditDialog<R = unknown>(model: Model, configs?: MatDialogConfig, extras?: object): MatDialogRef<DialogComponent, R> {
    return this.dialog.open<DialogComponent, DialogDataContract<Model>, R>(this.getDialogComponent(), {
      width: '560px',
      maxWidth: '92vw',
      ...configs,
      data: { model, operation: Operations.UPDATE, extras }
    });
  }
}
