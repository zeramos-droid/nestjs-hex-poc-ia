import { DomainError } from './base.error';

export class ProductNotAvailableError extends DomainError {
  constructor(
    public readonly productId: string,
    public readonly reason: 'inactive' | 'out-of-stock' | 'discontinued',
  ) {
    super(`Product '${productId}' is not available: ${reason}`);
  }

  static inactive(productId: string): ProductNotAvailableError {
    return new ProductNotAvailableError(productId, 'inactive');
  }

  static outOfStock(productId: string): ProductNotAvailableError {
    return new ProductNotAvailableError(productId, 'out-of-stock');
  }

  static discontinued(productId: string): ProductNotAvailableError {
    return new ProductNotAvailableError(productId, 'discontinued');
  }

  isInactive(): boolean {
    return this.reason === 'inactive';
  }

  isOutOfStock(): boolean {
    return this.reason === 'out-of-stock';
  }

  isDiscontinued(): boolean {
    return this.reason === 'discontinued';
  }
}
