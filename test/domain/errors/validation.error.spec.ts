import { ValidationError } from '@/domain/errors/validation.error';
import { DomainError } from '@/domain/errors/base.error';

describe('ValidationError', () => {
  describe('constructor', () => {
    it('should create error with message only', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.field).toBeUndefined();
    });

    it('should create error with message and field', () => {
      const error = new ValidationError('Email is required', 'email');

      expect(error.message).toBe('Email is required');
      expect(error.field).toBe('email');
    });

    it('should extend DomainError', () => {
      const error = new ValidationError('Test error');

      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should have correct name', () => {
      const error = new ValidationError('Invalid value');

      expect(error.name).toBe('ValidationError');
    });

    it('should have stack trace', () => {
      const error = new ValidationError('Test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ValidationError');
    });
  });

  describe('properties', () => {
    it('should expose field when provided', () => {
      const error = new ValidationError('Price must be positive', 'price');

      expect(error.field).toBe('price');
    });

    it('should have undefined field when not provided', () => {
      const error = new ValidationError('General validation error');

      expect(error.field).toBeUndefined();
    });
  });
});
