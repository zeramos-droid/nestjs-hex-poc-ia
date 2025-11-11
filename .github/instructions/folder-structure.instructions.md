---
applyTo: '**'
---

# Folder Structure - Single Microservice Architecture

## Complete Project Structure

**This is a single microservice template following hexagonal architecture.**

```
src/
├── domain/
│   ├── contracts/                  # Interfaces (I-prefix) & DTOs (I-prefix + DTO-suffix)
│   ├── entities/                   # Domain entities with _entity schema pattern
│   ├── value-objects/              # Value objects with validation (also use _entity pattern)
│   └── errors/                     # Custom domain errors
├── application/
│   ├── use-cases/                  # Orchestration use cases (max 3 dependencies, IUseCase<TInput, TOutput>)
│   └── config/
│       └── tokens.ts               # Dependency injection tokens using Symbol()
├── infrastructure/
│   ├── repositories/               # Data persistence implementations
│   ├── orm/                        # Database entities and mappings (TypeORM, Prisma, etc.)
│   ├── dto/                        # API DTOs with validation decorators (class-validator)
│   ├── controllers/                # REST/GraphQL endpoints (uses NestJS decorators)
│   ├── http-client/                # HTTP client implementations (if needed for external APIs)
│   ├── logger/                     # Logger implementations (Winston, Pino, etc.)
│   ├── uuid/                       # UUID generator implementations
│   └── app.module.ts               # Main NestJS module configuration (handles all DI)
├── main.ts                         # Application entry point
└── app.controller.ts               # Root controller (health checks, etc.)
test/
├── domain/                         # Domain layer tests
│   ├── entities/
│   └── value-objects/
├── application/                    # Application layer tests
│   └── use-cases/
├── infrastructure/                 # Infrastructure layer tests
│   ├── controllers/
│   └── repositories/
└── app.e2e-spec.ts                # E2E tests
```

## Architecture Principles

**Single Microservice = One Bounded Context**
- All code serves a single business domain
- No need for `modules/` folder structure
- No need for `shared/` module - utilities go in infrastructure
- Simpler navigation and maintenance

## Layer Guidelines
## Layer Guidelines

### Domain Layer (`src/domain/`)
```
domain/
├── contracts/         # Interfaces (I-prefix) & DTOs (I-prefix + DTO-suffix) - used by use cases
│   ├── repositories/
│   │   └── product-repository.interface.ts
│   ├── services/
│   │   └── email-service.interface.ts
│   └── dtos/
│       ├── create-product.dto.ts           # Domain DTO (interface)
│       ├── product-response.dto.ts         # Domain DTO (interface)
│       └── product-filters.dto.ts          # Domain DTO (interface)
├── entities/          # Domain entities with _entity schema pattern
│   ├── product.ts
│   └── category.ts
├── value-objects/     # Value objects with _entity schema pattern
│   ├── price.ts
│   └── product-code.ts
└── errors/            # Custom domain errors
    ├── product-not-found.error.ts
    └── invalid-price.error.ts
```

### Application Layer (`src/application/`)
```
application/
├── use-cases/         # Orchestration use cases (max 3 dependencies)
│   ├── get-products.use-case.ts
│   ├── get-product-by-id.use-case.ts
│   ├── create-product.use-case.ts
│   └── update-product.use-case.ts
└── config/
    └── tokens.ts      # Dependency injection tokens using Symbol()
```

### Infrastructure Layer (`src/infrastructure/`)
```
infrastructure/
├── repositories/      # Data persistence implementations
│   └── product.repository.ts
├── orm/               # Database entities and mappings
│   └── product.entity.ts
├── dto/               # API DTOs with validation decorators - used by controllers
│   ├── create-product.dto.ts              # API DTO (class with validators)
│   ├── product-response.dto.ts            # API DTO (class)
│   └── product-filters.dto.ts             # API DTO (class with validators)
├── controllers/       # REST/GraphQL endpoints
│   └── product.controller.ts
├── http-client/       # HTTP client implementations (if calling external APIs)
│   └── fetch-http-client.ts
├── logger/            # Logger implementations
│   └── winston-logger.ts
├── uuid/              # UUID generator implementations
│   └── uuid-v4-generator.ts
└── app.module.ts      # Main NestJS module configuration (handles all DI)
```
    ├── repositories/      # Data persistence implementations
    ├── orm/               # Database entities and mappings (TypeORM, Prisma, etc.)
    ├── dto/               # API DTOs with validation decorators - used by controllers
    ├── controllers/       # REST/GraphQL endpoints (uses NestJS decorators)
    └── {module-name}.module.ts  # NestJS module configuration (handles all DI)

src/test/modules/{module-name}/
├── domain/
├── application/
└── infrastructure/
```

**DTO Guidelines:**
- **Domain DTOs** (`domain/contracts/dtos/`) - Interfaces (`I` prefix + `DTO` suffix) used by use cases for business logic
  - Example: `ICreateProductDTO`, `IProductResponseDTO`, `IProductFiltersDTO`
  - Pure TypeScript interfaces - no decorators
  - Define the contract between use cases and repositories
- **API DTOs** (`infrastructure/dto/`) - Classes with validation decorators (`class-validator`) used by controllers
  - Example: `CreateProductDto`, `ProductResponseDto`, `ProductFiltersDto`
  - Classes with validation decorators (`@IsString()`, `@IsNumber()`, etc.)
  - Used for HTTP request/response validation
  - Must implement their corresponding domain DTO interfaces
- **Flow**: Controller receives API DTO → Converts to Domain DTO → Calls use case with Domain DTO → Use case returns Domain DTO → Controller converts to API response

**Key Rules:**
- ✅ One microservice = One bounded context
- ✅ Hexagonal layers: `domain/`, `application/`, `infrastructure/` at root level
- ✅ Controllers live in `infrastructure/controllers/`
- ✅ DI tokens defined in `application/config/tokens.ts` using Symbol()
- ✅ `app.module.ts` handles all dependency injection
- ✅ Utilities (HTTP client, logger, UUID) go in `infrastructure/`

## Generic Use Case Interface

All use cases must implement this generic interface:

```typescript
// domain/contracts/use-case.interface.ts
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
```

## Example: Product Use Case

```typescript
// application/use-cases/get-products.use-case.ts
import { IUseCase } from '@/domain/contracts/use-case.interface';
import { IProductFiltersDTO } from '@/domain/contracts/dtos/product-filters.dto';
import { IPaginationResult } from '@/domain/contracts/dtos/pagination-result.dto';

export class GetProductsUseCase implements IUseCase<IProductFiltersDTO, IPaginationResult> {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(filters: IProductFiltersDTO): Promise<IPaginationResult> {
    return await this.productRepository.getProducts(filters);
  }
}
```
```

## What NOT to Do

❌ **Never** create nested modules (`src/modules/products/submodule`) - not allowed  
❌ **Never** put business logic in infrastructure layer  
❌ **Never** import NestJS decorators in domain or application layers  
❌ **Never** expose domain entities directly (always use DTOs)  
❌ **Never** skip tests (maintain 95%+ lines/statements, 90%+ branches/functions)
