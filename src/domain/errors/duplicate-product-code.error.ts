import { DomainError } from './base.error';

export class DuplicateProductCodeError extends DomainError {
  constructor(
    public readonly code: string,
    public readonly codeType: 'sku' | 'product-code' = 'sku',
  ) {
    super(`Product ${codeType} '${code}' already exists`);
  }
}
