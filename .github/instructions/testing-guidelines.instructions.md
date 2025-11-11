---
applyTo: '**/tests/**'
---

# Testing Guidelines

## Testing Strategy

### Test Structure
- **Mirror source structure**: Tests mirror `src/modules/` folder structure in `test/modules/`
- **Coverage requirement**: Maintain at least **95% test coverage** (lines/statements), **90% branches/functions**
- **Test types (Priority Order)**:
  1. **Controller tests**: Use NestJS testing utilities (@nestjs/testing) - Test HTTP layer first
  2. **Use case tests**: Unit tests with mocked repositories - Test business orchestration
  3. **Domain tests**: Pure unit tests for entities and value objects (no mocks) - Test business rules
  4. **E2E tests**: Integration tests using NestJS supertest - Test complete flows

### Testing Philosophy
- **Test from outside-in**: Start with controllers (API contracts), then use cases, then domain
- **Use NestJS Test utilities**: Leverage `Test.createTestingModule()` for dependency injection
- **Mock at boundaries**: Mock repositories and external services, not domain entities
- **Fast execution**: All unit tests should run in milliseconds

### Coverage Requirements
```bash
# Generate coverage report
npm run test:coverage

# Coverage thresholds (jest.config.js)
coverageThreshold: {
  global: {
    branches: 90,
    functions: 90,
    lines: 95,
    statements: 95,
  },
}
```

## Priority 1: Controller Testing (NestJS Test Module)

Controllers are the entry point to your application. Test them first to ensure API contracts work correctly.

### NestJS Controller Testing Pattern
```typescript
// tests/modules/products/infrastructure/controllers/product.controller.test.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '@/modules/products/infrastructure/controllers/product.controller';
import { PRODUCT_TOKENS } from '@/modules/products/application/config/tokens';
import { IGetProductsUseCase } from '@/modules/products/domain/contracts/get-products-use-case.interface';
import { IGetProductByIdUseCase } from '@/modules/products/domain/contracts/get-product-by-id-use-case.interface';

describe('ProductController', () => {
  let controller: ProductController;
  let getProductsUseCase: jest.Mocked<IGetProductsUseCase>;
  let getProductByIdUseCase: jest.Mocked<IGetProductByIdUseCase>;

  beforeEach(async () => {
    const mockGetProductsUseCase = {
      execute: jest.fn(),
    };

    const mockGetProductByIdUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
          useValue: mockGetProductsUseCase,
        },
        {
          provide: PRODUCT_TOKENS.GET_PRODUCT_BY_ID_USE_CASE,
          useValue: mockGetProductByIdUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    getProductsUseCase = module.get(PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE);
    getProductByIdUseCase = module.get(PRODUCT_TOKENS.GET_PRODUCT_BY_ID_USE_CASE);
  });

  describe('getProducts', () => {
    it('should return products', async () => {
      const mockResult = {
        data: [
          {
            id: '1',
            title: 'Laptop',
            price: 1500,
            formattedPrice: '$1,500.00',
            description: 'Description',
            images: ['image.jpg'],
            category: 'Electronics',
            createdAt: '2024-01-01',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      };

      getProductsUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getProducts({
        page: 1,
        pageSize: 10,
        search: '',
      });

      expect(result).toEqual(mockResult);
      expect(getProductsUseCase.execute).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        search: '',
      });
    });

    it('should handle errors', async () => {
      getProductsUseCase.execute.mockRejectedValue(new Error('API error'));

      await expect(
        controller.getProducts({ page: 1, pageSize: 10, search: '' })
      ).rejects.toThrow('API error');
    });
  });

  describe('getProductById', () => {
    it('should return a single product', async () => {
      const mockProduct = {
        id: '1',
        title: 'Laptop',
        price: 1500,
        formattedPrice: '$1,500.00',
        description: 'Description',
        images: ['image.jpg'],
        category: 'Electronics',
        createdAt: '2024-01-01',
      };

      getProductByIdUseCase.execute.mockResolvedValue(mockProduct);

      const result = await controller.getProductById('1');

      expect(result).toEqual(mockProduct);
      expect(getProductByIdUseCase.execute).toHaveBeenCalledWith('1');
    });
  });
});
```

### Controller Testing Rules
- ✅ **Use NestJS testing utilities** - Test.createTestingModule()
- ✅ **Mock use cases** - Mock use case dependencies via providers
- ✅ **Test HTTP handling** - Verify controller methods work correctly
- ✅ **Test DTO conversion** - Ensure API DTOs convert to Domain DTOs
- ✅ **Test error handling** - Verify error responses
- ❌ **Don't test business logic** - Business logic is in domain/use cases

## Priority 2: Use Case Testing (Application Layer)

After controllers are tested, test use cases to ensure business orchestration works correctly.

### Testing Use Cases
```typescript
// tests/modules/products/list/application/use-cases/product-list.use-case.test.ts
import { ProductListUseCase } from '@/modules/products/list/application/use-cases/product-list.use-case';
import { IProductRepository } from '@/modules/products/list/domain/contracts/product-repository.interface';
import { Product } from '@/modules/products/list/domain/entities/product';
import { ProductFetchError } from '@/modules/products/list/domain/errors/product-fetch-error';

describe('ProductListUseCase', () => {
  let useCase: ProductListUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      getProducts: jest.fn(),
      getProductById: jest.fn(),
    } as jest.Mocked<IProductRepository>;

    useCase = new ProductListUseCase(mockRepository);
  });

  describe('getProducts', () => {
    it('should return products as DTOs', async () => {
      const mockProduct = Product.create(
        '1',
        'Laptop',
        1500,
        'Description',
        ['image.jpg'],
        'Electronics',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      mockRepository.getProducts.mockResolvedValue({
        data: [mockProduct],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });

      const result = await useCase.getProducts({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: '1',
        title: 'Laptop',
        price: 1500,
        formattedPrice: '$1,500.00',
        description: 'Description',
        images: ['image.jpg'],
        category: 'Electronics',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should handle repository errors', async () => {
      mockRepository.getProducts.mockRejectedValue(
        new ProductFetchError('API error')
      );

      await expect(
        useCase.getProducts({ page: 1, pageSize: 10 })
      ).rejects.toThrow('Failed to fetch products');
    });
  });

  describe('getProductById', () => {
    it('should return product as DTO', async () => {
      const mockProduct = Product.create(
        '1',
        'Laptop',
        1500,
        'Description',
        ['image.jpg'],
        'Electronics',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      mockRepository.getProductById.mockResolvedValue(mockProduct);

      const result = await useCase.getProductById('1');

      expect(result.id).toBe('1');
      expect(result.title).toBe('Laptop');
    });
  });
});
```

### Application Testing Rules
- ✅ **Always mock dependencies** - Mock repositories, external services
- ✅ **Test use case orchestration** - Verify use case calls repository correctly
- ✅ **Test DTO conversion** - Ensure entities converted to DTOs
- ✅ **Test error handling** - Verify error interpretation
- ❌ **Never test infrastructure** - Don't test actual repositories/APIs

## Priority 3: Domain Layer Testing

Domain tests are pure unit tests - test entities, value objects, and business rules.

### Testing Entities
```typescript
// tests/modules/products/list/domain/entities/product.test.ts
import { Product } from '@/modules/products/list/domain/entities/product';

describe('Product Entity', () => {
  describe('create', () => {
    it('should create a valid product', () => {
      const product = Product.create(
        '1',
        'Laptop',
        1500,
        'High-end laptop',
        ['image1.jpg'],
        'Electronics',
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );

      expect(product.id).toBe('1');
      expect(product.title).toBe('Laptop');
      expect(product.price).toBe(1500);
    });
  });

  describe('getFormattedPrice', () => {
    it('should format price correctly', () => {
      const product = Product.create('1', 'Laptop', 1500.50, '', [], '', new Date(), new Date());
      
      expect(product.getFormattedPrice()).toBe('$1,500.50');
    });
  });

  describe('isExpensive', () => {
    it('should return true for products over $1000', () => {
      const product = Product.create('1', 'Laptop', 1500, '', [], '', new Date(), new Date());
      
      expect(product.isExpensive()).toBe(true);
    });

    it('should return false for products under $1000', () => {
      const product = Product.create('2', 'Mouse', 25, '', [], '', new Date(), new Date());
      
      expect(product.isExpensive()).toBe(false);
    });
  });

  describe('updatePrice', () => {
    it('should return new product instance with updated price', () => {
      const product = Product.create('1', 'Laptop', 1500, '', [], '', new Date(), new Date());
      const updated = product.updatePrice(1200);

      expect(updated.price).toBe(1200);
      expect(product.price).toBe(1500); // Original unchanged
      expect(updated).not.toBe(product); // New instance
    });
  });
});
```

### Testing Value Objects
```typescript
// tests/modules/products/list/domain/value-objects/price.test.ts
import { Price } from '@/modules/products/list/domain/value-objects/price';

describe('Price Value Object', () => {
  describe('create', () => {
    it('should create valid price', () => {
      const price = Price.create(100, 'USD');

      expect(price.value).toBe(100);
      expect(price.currency).toBe('USD');
    });

    it('should throw error for negative price', () => {
      expect(() => Price.create(-10, 'USD')).toThrow('Price cannot be negative');
    });

    it('should throw error for invalid currency', () => {
      expect(() => Price.create(100, 'INVALID')).toThrow('Invalid currency');
    });

    it('should use USD as default currency', () => {
      const price = Price.create(100);

      expect(price.currency).toBe('USD');
    });
  });

  describe('getFormatted', () => {
    it('should format price with currency', () => {
      const price = Price.create(100, 'USD');

      expect(price.getFormatted()).toBe('USD 100.00');
    });
  });

  describe('equals', () => {
    it('should return true for equal prices', () => {
      const price1 = Price.create(100, 'USD');
      const price2 = Price.create(100, 'USD');

      expect(price1.equals(price2)).toBe(true);
    });

    it('should return false for different values', () => {
      const price1 = Price.create(100, 'USD');
      const price2 = Price.create(200, 'USD');

      expect(price1.equals(price2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const price1 = Price.create(100, 'USD');
      const price2 = Price.create(100, 'EUR');

      expect(price1.equals(price2)).toBe(false);
    });
  });
});
```

### Domain Testing Rules
- ✅ **No mocks needed** - Domain layer is pure TypeScript
- ✅ **Test all business logic** - Cover all entity methods
- ✅ **Test validation** - Verify value object validation works
- ✅ **Test immutability** - Ensure entities return new instances
- ✅ **Edge cases** - Test boundary conditions
- ❌ **No infrastructure** - Don't test repositories here

## Best Practices

### General Testing Rules
- ✅ **Test public APIs only** - Don't test private methods
- ✅ **Fast tests** - Tests should run quickly
- ✅ **Deterministic** - Tests should always produce same result
- ✅ **Cover edge cases** - Test boundary conditions
- ✅ **Use jest.fn()** - For simple mocks
- ✅ **Use jest-mock-extended** - For complex interface mocks
- ✅ **90%+ coverage** - Maintain high test coverage
- ❌ **Don't test implementation** - Test behavior, not internals
- ❌ **Don't create test-only interfaces** - Use domain interfaces
- ❌ **Don't test infrastructure** - Always mock external dependencies

### Mock Guidelines
```typescript
// Simple mock with jest.fn()
const mockFunction = jest.fn().mockReturnValue('value');

// Complex mock with jest-mock-extended
import { mock } from 'jest-mock-extended';
const mockRepository = mock<IProductRepository>();
mockRepository.getProducts.mockResolvedValue({ /* ... */ });

// Mock module
jest.mock('@/modules/shared/http-client', () => ({
  FetchHttpClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
  })),
}));
```

### File Organization
```
tests/
└── modules/
    └── products/
        └── list/
            ├── domain/
            │   ├── entities/
            │   │   └── product.test.ts
            │   └── value-objects/
            │       └── price.test.ts
            ├── application/
            │   └── use-cases/
            │       └── product-list.use-case.test.ts
            └── infrastructure/
                ├── controllers/
                │   └── product.controller.test.ts
                └── repositories/
                    └── platzi-product.repository.test.ts
```

## What NOT to Do

❌ **Never** test infrastructure services like databases or AWS in use case tests  
❌ **Never** skip mocking external dependencies  
❌ **Never** test private methods directly  
❌ **Never** create interfaces just for testing  
❌ **Never** write slow tests (database calls without mocks)  
❌ **Never** write flaky tests (non-deterministic)  
❌ **Never** skip edge case testing  
❌ **Never** forget to check test coverage (`npm run test:coverage`)
