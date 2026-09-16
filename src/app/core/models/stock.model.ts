import { Validators } from '@angular/forms';
import { CrudModel } from '../abstracts/crud-model';

export type StockBatchStatus = 'ACTIVE' | 'EXPIRED' | 'DISCARDED' | 'GOOD' | 'LOW' | 'EXPIRING_SOON';

export class StockBatch extends CrudModel<StockBatch> {
  declare productId: number;
  declare productName?: string;
  declare batchNumber: string;
  declare quantityCurrent: number;
  declare quantityInitial: number;
  declare expiryDate: string;
  declare productionDate?: string;
  declare location?: string;
  declare shelf?: string;
  declare warehouse?: string;
  declare notes?: string;
  declare status: StockBatchStatus;
  declare createdAt?: string;
  declare updatedAt?: string;
  declare storeId?: number;
  declare buyPrice?: number;
  declare sellPrice?: number;
  declare version?: number;

  constructor(init?: Partial<StockBatch>) {
    super();
    Object.assign(this, init);
  }

  buildFormControls(): object {
    return {
      productId: [this.productId ?? null, Validators.required],
      batchNumber: [this.batchNumber ?? '', Validators.required],
      quantityInitial: [this.quantityInitial ?? 0, [Validators.required, Validators.min(0)]],
      quantityCurrent: [this.quantityCurrent ?? 0],
      expiryDate: [this.expiryDate ?? '', Validators.required],
      productionDate: [this.productionDate ?? ''],
      location: [this.location ?? ''],
      shelf: [this.shelf ?? ''],
      warehouse: [this.warehouse ?? ''],
      buyPrice: [this.buyPrice ?? 0],
      sellPrice: [this.sellPrice ?? 0],
      notes: [this.notes ?? '']
    };
  }
}

export interface StockBatchResponse {
  content: StockBatch[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
}

export interface StockAdjustmentHistory {
  id: number;
  batchId: number;
  batchNumber?: string;
  productName?: string;
  type: 'ADD' | 'REMOVE' | 'CORRECTION';
  quantity: number;
  reason: 'DAMAGED' | 'EXPIRED' | 'RETURNED' | 'COUNT_ERROR' | 'OTHER';
  previousQuantity: number;
  newQuantity: number;
  notes?: string;
  adjustmentDate: string;
  adjustedBy?: number;
  adjustedByName?: string;
}

export interface StockAdjustment {
  batchId: number;
  type: 'ADD' | 'REMOVE' | 'CORRECTION';
  quantity: number;
  reason: 'DAMAGED' | 'EXPIRED' | 'RETURNED' | 'COUNT_ERROR' | 'OTHER';
  notes?: string;
  adjustmentDate?: string;
}
