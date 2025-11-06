---
applyTo: '**'
---

# Hexagonal Architecture Principles

## Core Architectural Principles

### Strict Boundaries

- **src/modules** never imports out from itself (no cross-module imports, only from shared)
- **Domain and Application layers** NEVER import external libraries from node_modules directly
- **Reusability First** - ALWAYS check `src/modules/shared/` before creating new services or utilities
- Every module follows hexagonal architecture and Domain-Driven Design principles
- Every module is a bounded context with its own domain, application, and infrastructure layers
- **Modules CANNOT have submodules** - Each module represents a business capability
- Modules are completely independent and avoid sharing domain entities
- Modules communicate via interfaces and dependency injection only
- Regular modules: `src/modules/{module-name}/` (NO submodules allowed)
- Shared module: `src/modules/shared/` (flat structure, no submodules)
- Modules have single responsibility based on business domain
- No business logic in application or infrastructure layers (ONLY in domain)
- No circular dependencies between modules or layers
- Domain layer is pure TypeScript with zero framework dependencies
- Infrastructure layer handles external integrations; class-based OOP allowed
- Application layer contains services for orchestration (max 3 dependencies)
- Business rules ONLY in domain entities and value objects
- Maximum 3 dependencies per constructor and function parameters
- Maximum 300 lines per file to ensure maintainability

## Layer Responsibilities

| Layer                                | NestJS Aware | Responsibility                                                           |
| ------------------------------------ | ------------ | ------------------------------------------------------------------------ |
| `modules/infrastructure/controllers` | ✅           | REST/GraphQL endpoints; uses NestJS decorators (@Controller, @Get, etc.) |
| `modules/domain/contracts`           | ❌           | Interfaces (I-prefix) & DTOs (I-prefix + DTO-suffix)                     |
| `modules/domain/entities`            | ❌           | Domain entities with `_entity` schema pattern; immutable                 |
| `modules/domain/value-objects`       | ❌           | Validation & business rules with `_entity` schema pattern                |
| `modules/infrastructure`             | ❌           | Framework-agnostic implementations; class-based OOP ok                   |
| `modules/application/services`       | ❌           | Orchestration only (max 3 dependencies); no business logic               |
| `modules/application/dto`            | ❌           | Data Transfer Objects for API requests/responses                         |

## Dependency Rules

- Use interfaces and dependency injection to decouple layers
- Avoid leaking NestJS decorators into domain or application layers
- Enforce boundaries with eslint-plugin-hexagonal-architecture
- src/modules layers must not import out itselft (no cross-module imports, only from shared)
- Use dependency injection to manage services and mock dependencies for tests

### External Library Usage Rule

**CRITICAL**: External libraries from `node_modules` **CANNOT** be imported directly in `domain/` or `application/` layers.

**Why?**

- Domain and application layers must remain framework-agnostic
- Direct imports create tight coupling to external dependencies
- Makes testing difficult and limits flexibility
- Violates hexagonal architecture principles

**Solution**: Create interface wrappers in `shared/` modules

**Example - HTTP Client:**

```typescript
// ❌ WRONG - Direct import in application layer
import axios from 'axios'; // NO!

export class ProductUseCase {
  async getProducts() {
    const response = await axios.get('/products'); // Tight coupling!
  }
}
```

```typescript
// ✅ CORRECT - Interface in domain, implementation in shared module

// 1. Define interface in shared/domain/contracts/
export interface IHttpClient {
  get<T>(url: string): Promise<IHttpResponse<T>>;
  post<T>(url: string, data: unknown): Promise<IHttpResponse<T>>;
}

// 2. Implement in shared/infrastructure/http-client/
import axios from 'axios'; // OK in infrastructure!

export class AxiosHttpClient implements IHttpClient {
  async get<T>(url: string): Promise<IHttpResponse<T>> {
    const response = await axios.get(url);
    return { data: response.data, status: response.status };
  }
}

// 3. Use interface in application/domain layers
export class ProductUseCase implements IProductUseCase {
  constructor(private httpClient: IHttpClient) {} // Interface only!

  async getProducts() {
    const response = await this.httpClient.get('/products'); // Decoupled!
  }
}
```

**Common Libraries Requiring Wrappers:**

- **HTTP clients** (axios, fetch) → `IHttpClient` in `shared/domain/contracts/`
- **Logging** (winston, pino) → `ILogger` in `shared/domain/contracts/`
- **Date libraries** (dayjs, date-fns) → `IDateService` in `shared/domain/contracts/`
- **Storage** (AWS S3, local) → `IStorageService` in `shared/domain/contracts/`
- **Authentication** (JWT, OAuth) → `IAuthService` in `shared/domain/contracts/`

**Allowed Direct Imports:**

- ✅ TypeScript utilities (built-in types)
- ✅ Node.js built-ins (in infrastructure only)
- ✅ NestJS decorators (in infrastructure/controllers only)
- ❌ Third-party libraries in domain/application (use interfaces!)

**Rule Summary:**

1. External library needed in domain/application? → Create interface in `shared/domain/contracts/`
2. Implement wrapper in `shared/infrastructure/{implementation-folder}/`
3. Inject interface via constructor (dependency injection)
4. Infrastructure layer can import directly from `node_modules`

## Performance & Scalability

- Keep modules isolated and loosely coupled to enable scalability and maintainability
- Leverage dependency injection to swap implementations easily and to facilitate testing
- Use NestJS features (caching, interceptors, guards) for performance optimization
