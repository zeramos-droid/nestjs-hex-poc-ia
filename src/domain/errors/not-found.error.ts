import { DomainError } from './base.error';

/**
 * Domain error thrown when a resource is not found
 * This is a business rule violation - the requested entity doesn't exist
 */
export class NotFoundError extends DomainError {
  constructor(
    public readonly resource: string,
    public readonly identifier: string,
  ) {
    super(`${resource} with identifier '${identifier}' not found`);
  }
}
