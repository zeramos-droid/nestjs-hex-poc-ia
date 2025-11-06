---
applyTo: '**/domain/**'
---

# Domain Layer Guidelines

## Core Principles

- **Pure TypeScript only** - Zero framework dependencies
- **NO node_modules imports** - Never import external libraries directly; use interfaces from shared modules implemented in infrastructure layer
- **Immutable entities** - Return new instances for updates
- **Business rules ONLY** - All validation and business logic lives here
- **Interface-first design** - All contracts use `I` prefix
- **DTO pattern** - All DTOs start with `I` and end with `DTO`
- **Specific interface methods** - Interfaces MUST have explicit, domain-specific methods (no generic `get(key: string)` or `set(key: string, value: any)`)

## Interfaces & Contracts

### Interface Design Principles (DDD Expert Level)

**✅ CORRECT - Specific, domain-driven methods:**
```typescript
// Good: Explicit, domain-specific methods
interface IEnvironmentService {
  getNodeEnv(): string;
  getPort(): number;
  isDevelopment(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
}

interface IProductRepository {
  findById(id: string): Promise<Product>;
  findAll(filters: IProductFiltersDTO): Promise<Product[]>;
  save(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}

interface IEmailService {
  sendWelcomeEmail(to: string, userName: string): Promise<void>;
  sendPasswordResetEmail(to: string, resetToken: string): Promise<void>;
  sendOrderConfirmation(to: string, orderId: string): Promise<void>;
}
```

**❌ WRONG - Generic, non-domain methods:**
```typescript
// Bad: Generic methods that could be anything
interface IEnvironmentService {
  get(key: string): string | undefined;  // ❌ Too generic
  getOrThrow(key: string): string;       // ❌ Not domain-specific
  set(key: string, value: any): void;    // ❌ Violates DDD
}

interface IRepository<T> {
  find(query: any): Promise<T[]>;        // ❌ Not type-safe
  save(entity: any): Promise<T>;         // ❌ Any type defeats purpose
}

interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;  // ❌ Too generic
}
```

**Rationale**: In Domain-Driven Design, interfaces represent domain concepts with explicit contracts. Generic methods like `get()` or `set()` hide the domain intent, make code harder to understand, and defeat the purpose of type safety. Each method should express a clear business operation.

### Interface Naming
```typescript
// Service interfaces
interface IProductService { /* ... */ }
interface IUserRepository { /* ... */ }

// DTO interfaces
interface ICreateProductDTO { /* ... */ }
interface IProductResponseDTO { /* ... */ }
interface IUpdateUserDTO { /* ... */ }
```

### Contract Structure
- All interfaces start with `I` (e.g., `IProductService`, `IUserRepository`)
- All DTOs start with `I` and end with `DTO` (e.g., `ICreateProductDTO`, `IProductResponseDTO`)
- Place interfaces in `domain/contracts/`
- One interface per file with `.interface.ts` suffix

## Entities

### Entity Pattern
Entities use the `_entity` schema pattern:

```typescript
interface IProductSchema {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
}

class Product {
  private constructor(private readonly _entity: IProductSchema) {}
  
  static create(id: string, name: string, price: number): Product {
    return new Product({
      id,
      name,
      price,
      createdAt: new Date(),
    });
  }
  
  // Getters for accessing entity data
  get id(): string {
    return this._entity.id;
  }
  
  get name(): string {
    return this._entity.name;
  }
  
  get price(): number {
    return this._entity.price;
  }
  
  // Business logic methods
  getFormattedPrice(): string {
    return `$${this._entity.price.toFixed(2)}`;
  }
  
  isExpensive(): boolean {
    return this._entity.price > 1000;
  }
  
  // Immutable updates - return new instance
  updatePrice(newPrice: number): Product {
    return new Product({
      ...this._entity,
      price: newPrice,
    });
  }
}
```

### Entity Rules
- **Private constructor** - Use static factory methods
- **Immutable** - Return new instances for updates
- **Business logic** - All domain rules in entity methods
- **Schema pattern** - `private readonly _entity: ISchema`
- **Getters only** - No public setters

## Value Objects

### Value Object Pattern
Value objects also use `_entity` schema pattern and validate in constructor:

```typescript
interface IPriceSchemaValueObject {
  value: number;
  currency: string;
}

class Price {
  private constructor(private readonly _entity: IPriceSchemaValueObject) {}
  
  static create(value: number, currency: string = 'USD'): Price {
    // Validation happens here
    if (value < 0) {
      throw new Error('Price cannot be negative');
    }
    if (!['USD', 'EUR', 'GBP'].includes(currency)) {
      throw new Error('Invalid currency');
    }
    
    return new Price({ value, currency });
  }
  
  get value(): number {
    return this._entity.value;
  }
  
  get currency(): string {
    return this._entity.currency;
  }
  
  // Business logic
  getFormatted(): string {
    return `${this._entity.currency} ${this._entity.value.toFixed(2)}`;
  }
  
  equals(other: Price): boolean {
    return (
      this._entity.value === other.value &&
      this._entity.currency === other.currency
    );
  }
}
```

### Value Object Rules
- **Validation in factory** - Throw errors for invalid values
- **Immutable** - No update methods
- **Value equality** - Implement `equals()` method
- **Schema pattern** - `private readonly _entity: ISchemaValueObject`
- **Business rules** - Encapsulate validation logic

## Domain Errors

### Custom Error Classes
**Domain errors represent business rule violations, NOT HTTP errors**

```typescript
// Base domain error
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific domain errors
export class ProductNotFoundError extends DomainError {
  constructor(
    public readonly productId: string,
  ) {
    super(`Product with ID ${productId} not found`);
  }
}

export class InvalidPriceError extends DomainError {
  constructor(
    public readonly price: number,
  ) {
    super(`Invalid price: ${price}. Price must be non-negative.`);
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
  }
}
```

### Error Rules
- **Extend DomainError** - All custom errors extend base DomainError class
- **Business rules only** - Errors represent domain concept violations
- **Descriptive names** - Name matches the error type
- **Helpful messages** - Include context in error message
- **NO HttpException** - Never use NestJS HttpException in domain layer
- **Controllers convert** - Infrastructure layer converts domain errors to HTTP responses

### Error Conversion (Infrastructure Layer)
```typescript
// Controller converts domain errors to HTTP exceptions
@Controller('products')
export class ProductController {
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getProduct(@Param('id') id: string) {
    try {
      return await this.getProductUseCase.execute(id);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof ValidationError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }
}
```

## DTOs (Data Transfer Objects)

### DTO Pattern (Domain Contracts + Infrastructure Implementation)

**Step 1: Define domain contracts (interfaces)** that use cases will depend on:

```typescript
// domain/contracts/create-product.dto.ts - Input DTO Contract
export interface ICreateProductDTO {
  name: string;
  price: number;
  categoryId: string;
}

// domain/contracts/product-response.dto.ts - Output DTO Contract
export interface IProductResponseDTO {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  createdAt: string;
}

// domain/contracts/product-filters.dto.ts - Filter DTO Contract
export interface IProductFiltersDTO {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  page: number;
  pageSize: number;
}
```

**Step 2: Implement contracts with validation** in infrastructure layer:

```typescript
// infrastructure/dto/create-product.dto.ts - API Request DTO (implements contract)
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ICreateProductDTO } from '@/modules/products/domain/contracts/create-product.dto';

export class CreateProductDto implements ICreateProductDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}

// infrastructure/dto/product-filters.dto.ts - API Query DTO (implements contract)
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { IProductFiltersDTO } from '@/modules/products/domain/contracts/product-filters.dto';

export class ProductFiltersDto implements IProductFiltersDTO {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @IsNumber()
  @Type(() => Number)
  pageSize: number = 10;
}

// infrastructure/dto/product-response.dto.ts - API Response DTO (implements contract)
import { IProductResponseDTO } from '@/modules/products/domain/contracts/product-response.dto';

export class ProductResponseDto implements IProductResponseDTO {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  createdAt: string;
}
```

**Step 3: Use cases depend on contracts (interfaces), not concrete classes:**

```typescript
// application/use-cases/create-product.use-case.ts
export class CreateProductUseCase implements IUseCase<ICreateProductDTO, IProductResponseDTO> {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: ICreateProductDTO): Promise<IProductResponseDTO> {
    // dto is typed as interface, not concrete class
    // Use case doesn't know about validation decorators
    const product = Product.create(dto.name, dto.price, dto.categoryId);
    const saved = await this.productRepository.save(product);
    return this.toDTO(saved);
  }
}
```

**Step 4: Controllers convert concrete DTOs to interfaces:**

```typescript
// infrastructure/controllers/product.controller.ts
@Controller('products')
export class ProductController {
  constructor(
    @Inject(PRODUCT_TOKENS.CREATE_PRODUCT_USE_CASE)
    private readonly createProductUseCase: ICreateProductUseCase,
  ) {}

  @Post()
  async createProduct(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    // dto is validated by class-validator (CreateProductDto)
    // Pass to use case as interface (ICreateProductDTO)
    const result = await this.createProductUseCase.execute(dto);
    
    // result is IProductResponseDTO, return as concrete class
    return result as ProductResponseDto;
  }
}
```

### DTO Rules
- **Domain DTOs (interfaces)**: Start with `I` and end with `DTO` - used by use cases
- **API DTOs (classes)**: No `I` prefix, no `DTO` suffix - used by controllers with validation
- **Implementation**: API DTOs MUST implement their corresponding domain DTO interfaces
- **Plain objects** - No methods, only data
- **Serializable** - JSON-safe types only
- **Purpose-specific** - Different DTOs for different use cases
- **Optional fields** - Use `?` for optional properties
- **Controller responsibility** - Controllers convert API DTOs to Domain DTOs

## File Organization

```
domain/
├── contracts/
│   ├── product-service.interface.ts       # Service interface
│   ├── product-repository.interface.ts    # Repository interface
│   ├── create-product.dto.ts              # Domain Input DTO (interface)
│   ├── product-response.dto.ts            # Domain Output DTO (interface)
│   └── product-filters.dto.ts             # Domain Filter DTO (interface)
├── entities/
│   ├── product.ts                         # Product entity
│   └── category.ts                        # Category entity
├── value-objects/
│   ├── price.ts                           # Price value object
│   └── product-code.ts                    # Product code value object
└── errors/
    ├── product-not-found.error.ts         # Custom error
    └── invalid-price.error.ts             # Custom error
```

**Note**: API DTOs (classes with validation) are in `infrastructure/dto/`

## What NOT to Do

❌ **Never** add framework dependencies (NestJS decorators in domain layer)  
❌ **Never** import external libraries from node_modules (axios, dayjs, etc.) - use interfaces from shared modules  
❌ **Never** add business logic in services or infrastructure  
❌ **Never** expose entities directly (always use DTOs)  
❌ **Never** make entities mutable  
❌ **Never** skip validation in value objects  
❌ **Never** forget `I` prefix on interfaces  
❌ **Never** forget `DTO` suffix on DTOs
