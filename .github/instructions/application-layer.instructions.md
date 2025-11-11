---
applyTo: '**/application/**'
---

# Application Layer Guidelines

## Core Principles

- **Single Responsibility** - One use case = One business operation = One `execute()` method
- **Generic Interface** - All use cases implement `IUseCase<TInput, TOutput>`
- **Orchestration only** - Use cases coordinate, don't contain business logic
- **Max 3 dependencies** - Keep constructors simple
- **DTO conversion** - Use cases convert entities to DTOs
- **No validation** - Handled by value objects in domain layer
- **NO node_modules imports** - Never import external libraries directly; use interfaces from shared modules implemented in infrastructure layer
- **@Injectable() decorator REQUIRED** - All use cases MUST use `@Injectable()` decorator for NestJS DI
- **@Inject() with Symbols** - Constructor parameters MUST use `@Inject(TOKEN_SYMBOL)` for dependency injection
- **NO factory functions** - Never use `useFactory` in modules; always use `useClass` with `@Injectable()`

## Use Cases

### Use Case Dependency Injection Pattern (CRITICAL)

**✅ CORRECT - Using @Injectable() and @Inject() with Symbols:**
```typescript
import { Inject, Injectable } from '@nestjs/common';
import { IGetProductsUseCase } from '../../domain/contracts/get-products-use-case.interface';
import type { IProductRepository } from '../../domain/contracts/product-repository.interface';
import { PRODUCT_TOKENS } from '../config/tokens';

@Injectable()
export class GetProductsUseCase implements IGetProductsUseCase {
  constructor(
    @Inject(PRODUCT_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(filters: IProductFiltersDTO): Promise<IPaginationResult> {
    return await this.productRepository.getProducts(filters);
  }
}
```

**❌ WRONG - Without @Injectable() or using factory functions:**
```typescript
// ❌ Missing @Injectable() decorator
export class GetProductsUseCase implements IGetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}
}

// ❌ Using factory function in module (DON'T DO THIS)
{
  provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
  useFactory: (repo: IProductRepository) => new GetProductsUseCase(repo),
  inject: [PRODUCT_TOKENS.PRODUCT_REPOSITORY],
}

// ✅ CORRECT - Use useClass instead
{
  provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
  useClass: GetProductsUseCase,
}
```

**Rationale**: `@Injectable()` enables NestJS's dependency injection container to manage the lifecycle and dependencies automatically. Using `@Inject()` with Symbol tokens provides type-safe, refactorable dependency injection. Factory functions add unnecessary complexity and bypass NestJS's DI container.

### Generic Use Case Interface

All use cases implement a generic interface with a single `execute()` method:

```typescript
// shared/domain/contracts/use-case.interface.ts
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
```

### Use Case Pattern

```typescript
// Use case interface in domain/contracts/
interface IGetProductsUseCase
  extends IUseCase<
    IProductFiltersDTO,
    IPaginationResult<IProductResponseDTO>
  > {}

interface IGetProductByIdUseCase
  extends IUseCase<string, IProductResponseDTO> {}

interface ICreateProductUseCase
  extends IUseCase<ICreateProductDTO, IProductResponseDTO> {}

// Use case implementation in application/use-cases/
export class GetProductsUseCase implements IGetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {
    // Max 3 dependencies per constructor
  }

  async execute(
    filters: IProductFiltersDTO
  ): Promise<IPaginationResult<IProductResponseDTO>> {
    try {
      // Orchestration: call repository
      const result = await this.productRepository.getProducts(filters);

      // Convert entities to DTOs
      return {
        data: result.data.map((product) => this.entityToDTO(product)),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      };
    } catch (error) {
      // Error interpretation only
      if (error instanceof ProductNotFoundError) {
        throw new Error('Products not found');
      }
      throw error;
    }
  }

  // Entity to DTO conversion
  private entityToDTO(product: Product): IProductResponseDTO {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      formattedPrice: product.getFormattedPrice(),
      createdAt: product.createdAt.toISOString(),
    };
  }
}
```

### Use Case Rules

- **Single Responsibility** - One use case = One `execute()` method only
- **Generic interface** - All implement `IUseCase<TInput, TOutput>`
- **Clear naming** - Name describes the action: `GetProductsUseCase`, `CreateOrderUseCase`
- **Orchestration only** - No business logic, only coordination
- **Max 3 dependencies** - Constructor takes max 3 parameters
- **DTO conversion** - Always convert entities to DTOs before returning
- **Error interpretation** - Translate domain errors to application errors
- **No validation** - All validation in domain layer
- **Interface implementation** - Each use case has its own interface

## File Organization

```
application/
├── use-cases/
│   ├── get-products.use-case.ts         # GetProductsUseCase
│   ├── get-product-by-id.use-case.ts    # GetProductByIdUseCase
│   ├── create-product.use-case.ts       # CreateProductUseCase
│   └── update-product.use-case.ts       # UpdateProductUseCase
└── config/
    └── tokens.ts                        # DI tokens using Symbol()
```

## What NOT to Do

❌ **Never** add business logic in use cases (domain only)  
❌ **Never** expose entities directly (always use DTOs)  
❌ **Never** exceed 3 dependencies in use case constructors  
❌ **Never** validate in use cases (domain layer handles it)  
❌ **Never** import external libraries from node_modules (axios, dayjs, etc.) - use interfaces from shared modules
