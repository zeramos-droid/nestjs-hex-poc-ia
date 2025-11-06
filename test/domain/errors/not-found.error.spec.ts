import { NotFoundError } from '@/domain/errors/not-found.error';
import { DomainError } from '@/domain/errors/base.error';

describe('NotFoundError', () => {
  describe('constructor', () => {
    it('should create error with correct message', () => {
      const error = new NotFoundError('Product', '123');

      expect(error.message).toBe("Product with identifier '123' not found");
      expect(error.resource).toBe('Product');
      expect(error.identifier).toBe('123');
    });

    it('should extend DomainError', () => {
      const error = new NotFoundError('User', 'abc');

      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const error = new NotFoundError('Order', '456');

      expect(error.name).toBe('NotFoundError');
    });

    it('should have stack trace', () => {
      const error = new NotFoundError('Category', '789');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('NotFoundError');
    });
  });

  describe('properties', () => {
    it('should expose resource and identifier', () => {
      const error = new NotFoundError('Customer', 'customer-123');

      expect(error.resource).toBe('Customer');
      expect(error.identifier).toBe('customer-123');
    });
  });
});
