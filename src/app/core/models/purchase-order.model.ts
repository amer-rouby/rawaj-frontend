import { Validators } from '@angular/forms';
import { CrudModel } from '../abstracts/crud-model';

export class PurchaseOrder extends CrudModel<PurchaseOrder> {
  declare orderNumber: string;
  declare storeId: number;
  declare supplierId: number;
  declare supplierName: string;
  declare orderDate: string;
  declare expectedDeliveryDate?: string;
  declare actualDeliveryDate?: string;
  declare totalAmount: number;
  declare status: PurchaseOrderStatus;
  declare priority: PurchaseOrderPriority;
  declare paymentTerms?: string;
  declare notes?: string;
  declare sourceType?: string;
  declare sourceId?: number;
  declare createdById?: number;
  declare createdByFullName?: string;
  declare createdAt: string;
  declare updatedAt: string;
  declare items: PurchaseOrderItem[];

  constructor(init?: Partial<PurchaseOrder>) {
    super();
    Object.assign(this, init);
  }

  /** The real create/edit form manages `items` as its own FormArray, not through this. */
  buildFormControls(): object {
    return {
      supplierId: [this.supplierId ?? null, Validators.required],
      orderDate: [this.orderDate ?? ''],
      expectedDeliveryDate: [this.expectedDeliveryDate ?? ''],
      priority: [this.priority ?? 'NORMAL'],
      paymentTerms: [this.paymentTerms ?? ''],
      notes: [this.notes ?? '']
    };
  }
}

export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'RECEIVED'
  | 'CANCELLED';

export type PurchaseOrderPriority =
  | 'LOW'
  | 'NORMAL'
  | 'URGENT';

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  fullyReceived: boolean;
  pendingQuantity: number;
}

export interface PurchaseOrderStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  received: number;
}

export interface SendEmailResponse {
  success: boolean;
  recipientEmail: string;
  message: string;
}

