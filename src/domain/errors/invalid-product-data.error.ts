import { DomainError } from './base.error';

export class InvalidProductDataError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
  ) {
    super(message);
  }

  static forField(field: string, reason: string, value?: unknown): InvalidProductDataError {
    return new InvalidProductDataError(
      `Invalid ${field}: ${reason}`,
      field,
      value,
    );
  }

  static forEmptyField(field: string): InvalidProductDataError {
    return new InvalidProductDataError(
      `${field} cannot be empty`,
      field,
    );
  }

  static forNegativeValue(field: string, value: number): InvalidProductDataError {
    return new InvalidProductDataError(
      `${field} cannot be negative. Received: ${value}`,
      field,
      value,
    );
  }

  static forInvalidFormat(field: string, expectedFormat: string, value: unknown): InvalidProductDataError {
    return new InvalidProductDataError(
      `Invalid ${field} format. Expected: ${expectedFormat}. Received: ${value}`,
      field,
      value,
    );
  }
}
