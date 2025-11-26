import { DomainError } from './base.error';

export class InsufficientStockError extends DomainError {
  constructor(
    public readonly productId: string,
    public readonly requestedQuantity: number,
    public readonly availableStock: number,
  ) {
    super(
      `Insufficient stock for product '${productId}'. Requested: ${requestedQuantity}, Available: ${availableStock}`,
    );
  }

  getMissingQuantity(): number {
    return this.requestedQuantity - this.availableStock;
  }
}
