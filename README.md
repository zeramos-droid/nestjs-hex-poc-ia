# NestJS Hexagonal Architecture Template

A production-ready NestJS 11 microservice template following hexagonal/ports & adapters architecture with Domain-Driven Design principles.

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js)](https://nodejs.org/)
[![Jest](https://img.shields.io/badge/Jest-95%25%20Coverage-C21325?logo=jest)](https://jestjs.io/)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🎯 Overview

This template provides a solid foundation for building scalable, maintainable microservices using:

- **NestJS 11** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Hexagonal Architecture** - Clean separation of concerns
- **Domain-Driven Design** - Business logic isolation
- **Test-Driven Development** - 95%+ code coverage requirement

### Key Features

✅ **Single Microservice Pattern** - One bounded context per service  
✅ **Strict Layer Boundaries** - Domain, Application, Infrastructure separation  
✅ **Interface-First Design** - All contracts defined as interfaces  
✅ **Immutable Entities** - `_entity` schema pattern with private constructors  
✅ **Symbol-Based DI** - Type-safe dependency injection  
✅ **High Test Coverage** - 95% lines/statements, 90% branches/functions  
✅ **Clear DTO Flow** - Separation of domain contracts and API validation

## 🏛️ Architecture Principles

### Hexagonal Architecture (NON-NEGOTIABLE)

The project follows strict hexagonal/ports & adapters architecture:

```
Domain Layer (Pure TypeScript) - src/domain/
  ├─ contracts/     → Interfaces (I-prefix), DTOs (I-prefix + DTO-suffix)
  ├─ entities/      → Business logic with _entity schema pattern
  ├─ value-objects/ → Validation with _entity pattern
  └─ errors/        → Domain-specific errors

Application Layer - src/application/
  ├─ use-cases/     → Orchestration ONLY (max 3 deps)
  └─ config/
      └─ tokens.ts  → Dependency injection tokens using Symbol()

Infrastructure Layer - src/infrastructure/
  ├─ repositories/  → Data persistence (implements domain contracts)
  ├─ orm/           → Database entities and mappings
  ├─ dto/           → API DTOs with validation decorators
  ├─ controllers/   → REST/GraphQL endpoints
  ├─ http-client/   → HTTP client implementations
  ├─ logger/        → Logger implementations
  ├─ uuid/          → UUID generator implementations
  └─ app.module.ts  → Main NestJS module configuration
```

### Layer Boundaries (Strictly Enforced)

**Forbidden Imports:**

- ❌ `infrastructure/controllers` → Never import into domain/application layers
- ❌ External framework code → Never import NestJS decorators in domain/application
- ❌ `node_modules` → Never import directly in domain/application (use interfaces)
- ✅ External libraries ONLY in infrastructure layer or via abstracted interfaces

### Core Design Patterns

#### 1. Entity Pattern (Domain Layer)

```typescript
interface IProductSchema {
  id: string;
  name: string;
  price: number;
}

class Product {
  private constructor(private readonly _entity: IProductSchema) {}

  static create(id: string, name: string, price: number): Product {
    // Validation here
    return new Product({ id, name, price });
  }

  get price(): number {
    return this._entity.price;
  }

  // Business logic methods
  isExpensive(): boolean {
    return this._entity.price > 1000;
  }
}
```

#### 2. Use Case Pattern (Application Layer)

```typescript
interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

export class GetProductsUseCase
  implements IUseCase<IProductFiltersDTO, IPaginationResult>
{
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(filters: IProductFiltersDTO): Promise<IPaginationResult> {
    try {
      return await this.productRepository.getProducts(filters);
    } catch (error) {
      throw new ProductFetchError('Failed to fetch');
    }
  }
}
```

#### 3. Dependency Injection Pattern

```typescript
// application/config/tokens.ts
export const PRODUCT_TOKENS = {
  PRODUCT_REPOSITORY: Symbol('IProductRepository'),
  GET_PRODUCTS_USE_CASE: Symbol('IGetProductsUseCase'),
};

export const INFRASTRUCTURE_TOKENS = {
  HTTP_CLIENT: Symbol('IHttpClient'),
  LOGGER: Symbol('ILogger'),
};

// infrastructure/app.module.ts
@Module({
  controllers: [ProductController],
  providers: [
    {
      provide: INFRASTRUCTURE_TOKENS.HTTP_CLIENT,
      useClass: FetchHttpClient,
    },
    {
      provide: PRODUCT_TOKENS.PRODUCT_REPOSITORY,
      useClass: PlatziProductRepository,
      inject: [INFRASTRUCTURE_TOKENS.HTTP_CLIENT],
    },
    {
      provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
      useClass: GetProductsUseCase,
      inject: [PRODUCT_TOKENS.PRODUCT_REPOSITORY],
    },
  ],
})
export class AppModule {}
```

## 📁 Project Structure

```
src/
├── domain/
│   ├── contracts/         # Interfaces (I-prefix) & DTOs (I-prefix + DTO-suffix)
│   │   ├── repositories/
│   │   ├── services/
│   │   └── dtos/
│   ├── entities/          # Domain entities with _entity schema pattern
│   ├── value-objects/     # Value objects with validation
│   └── errors/            # Custom domain errors
├── application/
│   ├── use-cases/         # Orchestration use cases (max 3 dependencies)
│   └── config/
│       └── tokens.ts      # Dependency injection tokens using Symbol()
├── infrastructure/
│   ├── repositories/      # Data persistence implementations
│   ├── orm/               # Database entities and mappings
│   ├── dto/               # API DTOs with validation decorators
│   ├── controllers/       # REST/GraphQL endpoints
│   ├── http-client/       # HTTP client implementations
│   ├── logger/            # Logger implementations
│   ├── uuid/              # UUID generator implementations
│   └── app.module.ts      # Main NestJS module configuration
├── main.ts                # Application entry point
└── app.controller.ts      # Root controller (health checks)

test/
├── domain/                # Domain layer tests
├── application/           # Application layer tests
├── infrastructure/        # Infrastructure layer tests
└── app.e2e-spec.ts       # E2E tests
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 22.x or higher
- **npm**: 10.x or higher

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nestjs-hexagonal-architecture

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Context7 MCP Server (optional - for library documentation)
CONTEXT7_API_KEY=your-api-key-here
```

### Running the Application

```bash
# Development mode with watch
npm run start:dev

# Development mode with debugging
npm run start:debug

# Production mode
npm run start:prod

# Build for production
npm run build
```

## 💻 Development Workflow

### Available Commands

```bash
npm run start:dev      # Start dev server with watch mode
npm run start:debug    # Start with debugging
npm run start:prod     # Production mode
npm run build          # Build for production
npm run test           # Run Jest tests
npm run test:watch     # Watch mode
npm run test:cov       # Generate coverage report
npm run test:e2e       # Run E2E tests
npm run lint           # ESLint check
```

### Naming Conventions

All file and folder names use **lowercase kebab-case**:

- **Entities**: `product.ts`, `auth-user.ts`
- **Value Objects**: `price.ts`, `email.ts`
- **Interfaces**: `product-repository.interface.ts`
- **Use Cases**: `get-products.use-case.ts`
- **Controllers**: `product.controller.ts`
- **DTOs**: `create-product.dto.ts`

**Code Naming**:

- **Interfaces**: `IProductService`, `IUserRepository` (I-prefix)
- **DTOs**: `ICreateProductDTO`, `IProductResponseDTO` (I-prefix + DTO-suffix)
- **Classes**: `Product`, `ProductService` (PascalCase)
- **Functions/Methods**: `createProduct`, `getUser` (camelCase)

### DTO Flow

```
Controller (API DTO) → Domain DTO → Use Case → Domain DTO → Controller (API Response)
```

**Domain DTOs** (`domain/contracts/dtos/`):

- Interfaces with `I` prefix + `DTO` suffix
- Used by use cases for business logic
- Pure TypeScript - no decorators

**API DTOs** (`infrastructure/dto/`):

- Classes with validation decorators (`class-validator`)
- Used by controllers for HTTP validation
- Must implement corresponding domain DTO interfaces

## 🧪 Testing Strategy

### Testing Priority Order

1. **Controller Tests** (API contracts) - Use NestJS `Test.createTestingModule()`
2. **Use Case Tests** (Business orchestration) - Mock repositories
3. **Domain Tests** (Business rules) - Pure unit tests (no mocks)

### Coverage Requirements

**Enforced by Jest**:

- ✅ 95% minimum for lines/statements
- ✅ 90% minimum for branches/functions

### Example Tests

#### Domain Test (No Mocks)

```typescript
describe('Product.create', () => {
  it('should create product with valid data', () => {
    const product = Product.create('1', 'Laptop', 1500);
    expect(product.price).toBe(1500);
  });
});
```

#### Use Case Test (Mock Repository)

```typescript
describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let mockRepo: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepo = { getProducts: jest.fn() } as any;
    useCase = new GetProductsUseCase(mockRepo);
  });

  it('should fetch products', async () => {
    mockRepo.getProducts.mockResolvedValue({ data: [], total: 0 });
    await useCase.execute({ page: 1, pageSize: 10 });
    expect(mockRepo.getProducts).toHaveBeenCalled();
  });
});
```

#### Controller Test (NestJS Testing)

```typescript
describe('ProductController', () => {
  let controller: ProductController;
  let useCase: jest.Mocked<IGetProductsUseCase>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    useCase = module.get(PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE);
  });

  it('should return products', async () => {
    useCase.execute.mockResolvedValue({ data: [], total: 0 });
    const result = await controller.getProducts({ page: 1, pageSize: 10 });
    expect(result).toEqual({ data: [], total: 0 });
  });
});
```

## 📚 Documentation

Comprehensive guidelines are available in `.github/instructions/`:

### Architecture & Structure

- **[Hexagonal Architecture](.github/instructions/hexagonal-architecture.instructions.md)** - Layer principles, boundaries, and responsibilities
- **[Folder Structure](.github/instructions/folder-structure.instructions.md)** - Complete module structure and organization
- **[Naming Conventions](.github/instructions/naming-conventions.instructions.md)** - File and code naming rules

### Layer-Specific Guidelines

- **[Domain Layer](.github/instructions/domain-layer.instructions.md)** - Entities, value objects, interfaces, DTOs, errors
- **[Application Layer](.github/instructions/application-layer.instructions.md)** - Use cases, orchestration
- **[Infrastructure Layer](.github/instructions/infrastructure-layer.instructions.md)** - Repositories, external services, DI

### Testing

- **[Testing Guidelines](.github/instructions/testing-guidelines.instructions.md)** - Strategy, coverage, domain/application/controller tests

### AI-Assisted Development

- **[GitHub Copilot Instructions](.github/copilot-instructions.md)** - Quick reference for AI productivity
- **[MCP Context7 Server](.github/instructions/mcp-context7.instructions.md)** - Library documentation integration

### Project Constitution

- **[Constitution](.specify/memory/constitution.md)** - Core principles and governance (v1.0.0)

## 🤝 Contributing

### Code Review Requirements

All PRs MUST verify:

- ✅ Layer boundaries respected (no forbidden imports)
- ✅ Test coverage meets thresholds (95% lines, 90% branches)
- ✅ Business logic only in domain layer
- ✅ Use cases have maximum 3 dependencies
- ✅ Entities are immutable
- ✅ All interfaces have `I` prefix
- ✅ All DTOs have `DTO` suffix
- ✅ Custom domain errors used appropriately

### What NOT to Do

❌ Import from infrastructure/controllers into domain/application layers  
❌ Place NestJS decorators inside domain or application layers  
❌ Skip writing unit or E2E tests (95%+ coverage required)  
❌ Add business logic in application use cases or infrastructure  
❌ Expose domain entities directly (always use DTOs)  
❌ Forget `I` prefix on interfaces or `DTO` suffix on DTOs  
❌ Create use cases with more than 3 dependencies  
❌ Import external libraries (node_modules) directly in domain/application layers

## 📝 License

[Nest](https://github.com/nestjs/nest) is [MIT licensed](LICENSE).

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- Hexagonal Architecture by Alistair Cockburn
- Domain-Driven Design by Eric Evans

---

**For detailed guidelines and examples, refer to the instruction files in `.github/instructions/`**
