import { Validators } from '@angular/forms';
import { CrudModel } from '../abstracts/crud-model';

export class Product extends CrudModel<Product> {
  declare storeId: number;
  declare name: string;
  declare barcode?: string;
  declare category?: string;
  declare unitType: string;
  declare minStockLevel: number;
  declare totalStock: number;
  declare sellPrice: number;
  declare buyPrice?: number;
  declare extraAttributes?: Record<string, unknown>;
  declare createdAt: string;
  declare updatedAt?: string;

  constructor(init?: Partial<Product>) {
    super();
    Object.assign(this, init);
  }

  buildFormControls(): object {
    return {
      name: [this.name ?? '', Validators.required],
      barcode: [this.barcode ?? ''],
      category: [this.category ?? ''],
      unitType: [this.unitType ?? 'PIECE'],
      minStockLevel: [this.minStockLevel ?? 10],
      sellPrice: [this.sellPrice ?? 0, [Validators.required, Validators.min(0.01)]],
      buyPrice: [this.buyPrice ?? 0]
    };
  }
}

/** Only relevant at creation - initialStock never comes back on a Product. */
export interface ProductRequest {
  name: string;
  barcode?: string;
  category?: string;
  unitType?: string;
  minStockLevel?: number;
  sellPrice: number;
  buyPrice?: number;
  extraAttributes?: Record<string, unknown>;
  initialStock?: number;
}
