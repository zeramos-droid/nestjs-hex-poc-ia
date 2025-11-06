/**
 * Base domain error class
 * All domain-specific errors should extend this class
 * These represent business rule violations, not HTTP errors
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
