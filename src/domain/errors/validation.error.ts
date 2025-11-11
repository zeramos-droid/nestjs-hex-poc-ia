import { DomainError } from './base.error';

/**
 * Domain error thrown when business validation fails
 * This represents a violation of domain business rules
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
  }
}
