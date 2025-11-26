import { DomainError } from './base.error';

export class ProductNotFoundError extends DomainError {
  constructor(
    public readonly identifier: string,
    public readonly identifierType: 'id' | 'sku' | 'code' = 'id',
  ) {
    super(`Product with ${identifierType} '${identifier}' not found`);
  }
}
