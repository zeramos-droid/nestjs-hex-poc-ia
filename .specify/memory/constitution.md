<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: 
  * Principle V (Interface Segregation) - Added explicit requirement for specific, domain-driven interface methods
- Added sections: 
  * Interface design examples (✅ correct vs ❌ wrong patterns)
  * Rationale expanded to emphasize business operation clarity
- Removed sections: None
- Templates requiring updates:
  ✅ constitution.md - Updated with specific interface method requirement (v1.1.0)
  ✅ domain-layer.instructions.md - Added "Interface Design Principles (DDD Expert Level)" section
  ⚠ plan-template.md - Should reference new constitution principles
  ⚠ spec-template.md - Should align with DDD and testing requirements
  ⚠ tasks-template.md - Should reflect layer-based task categorization
- Follow-up TODOs: None
-->

# NestJS Hexagonal Architecture Constitution

## Core Principles

### I. Hexagonal Architecture (NON-NEGOTIABLE)

The project MUST follow hexagonal/ports & adapters architecture with strict layer boundaries:

- **Domain Layer** (Pure TypeScript): Contains business logic, entities with `_entity` schema pattern, value objects, interfaces (I-prefix), DTOs (I-prefix + DTO-suffix), and domain errors. MUST NOT import from infrastructure or application layers. MUST NOT import external libraries from node_modules.

- **Application Layer**: Contains use cases implementing `IUseCase<TInput, TOutput>` for orchestration ONLY. Maximum 3 dependencies per use case. MUST NOT contain business logic. MUST NOT import from infrastructure layer. MUST NOT import external libraries from node_modules.

- **Infrastructure Layer**: Contains repositories, external services, NestJS controllers, API DTOs with validation decorators, ORM entities, HTTP clients, loggers, and UUID generators. Main `app.module.ts` handles all dependency injection using Symbol-based tokens.

**Rationale**: Hexagonal architecture ensures testability, maintainability, and flexibility by isolating business logic from framework and infrastructure concerns. Strict boundaries prevent tight coupling and enable independent evolution of layers.

### II. Single Microservice Pattern

This is a template for a SINGLE microservice representing ONE bounded context. MUST NOT create nested modules or shared folders.

- Project structure: Direct `src/domain/`, `src/application/`, `src/infrastructure/` at root level
- No `modules/` or `shared/` folder structure
- Utilities (HTTP client, logger, UUID) live directly in `infrastructure/` layer
- All dependency injection configured in single `app.module.ts`

**Rationale**: Single bounded context per microservice eliminates unnecessary complexity from multi-module structures. Simpler navigation and maintenance without artificial module boundaries.

### III. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory with prioritized testing approach:

1. **Controller tests FIRST** - Use NestJS `Test.createTestingModule()` to verify API contracts
2. **Use case tests SECOND** - Unit tests with mocked repositories to verify orchestration
3. **Domain tests THIRD** - Pure unit tests (no mocks) for entities and value objects

**Coverage requirements**:
- 95% minimum for lines/statements
- 90% minimum for branches/functions
- Enforced by Jest configuration

**Rationale**: Testing from outside-in ensures API contracts work before implementation. High coverage requirements maintain code quality and prevent regressions.

### IV. Domain-Driven Design

Business logic MUST reside exclusively in domain layer:

- Entities use private constructor with static factory methods (`create()`, `fromSchema()`)
- Entities are immutable - return new instances for updates
- Value objects validate in constructor and implement `equals()` method
- All business rules encapsulated in entity/value object methods
- Custom domain errors for all failure cases

**Rationale**: DDD ensures business logic is explicit, testable, and isolated from technical concerns. Immutability prevents unexpected state changes. Domain errors communicate business failures clearly.

### V. Interface Segregation & Dependency Inversion

All contracts defined as interfaces with strict naming conventions:

- All interfaces start with `I` prefix (e.g., `IProductRepository`, `IHttpClient`)
- Domain DTOs use `I` prefix + `DTO` suffix (e.g., `ICreateProductDTO`)
- API DTOs are classes implementing domain DTOs with validation decorators
- External libraries wrapped in interfaces (no direct node_modules imports in domain/application)
- Dependency injection using Symbol-based tokens in `application/config/tokens.ts`
- **Interfaces MUST have explicit, domain-specific methods** - No generic `get(key: string)` or `set(key: string, value: any)` methods

**Examples of specific interface methods:**
```typescript
✅ interface IEnvironmentService {
  getNodeEnv(): string;
  getPort(): number;
  isDevelopment(): boolean;
}

❌ interface IEnvironmentService {
  get(key: string): string | undefined;  // Too generic
  set(key: string, value: any): void;    // Violates DDD
}
```

**Rationale**: Interface-first design enables testing with mocks, allows swapping implementations, and prevents tight coupling to external libraries. Symbol-based DI prevents string-based token collisions. **Specific interface methods express clear business operations and prevent hiding domain intent behind generic operations.**

### VI. Explicit DTO Flow

Clear separation between domain contracts and API validation:

- **Domain DTOs** (`domain/contracts/dtos/`) - Interfaces for use case contracts
- **API DTOs** (`infrastructure/dto/`) - Classes with `class-validator` decorators
- Flow: Controller → API DTO → Domain DTO → Use Case → Domain DTO → Controller → API Response
- API DTOs MUST implement corresponding domain DTO interfaces

**Rationale**: Separating domain contracts from validation concerns keeps domain pure while enabling robust API validation. Clear flow prevents confusion about data transformation points.

### VII. Observability & Error Handling

All errors and logging follow consistent patterns:

- Custom domain errors extend base `Error` class with descriptive names
- Use cases interpret domain errors into application errors
- Controllers handle errors and return appropriate HTTP status codes
- Infrastructure services use logger interfaces (not direct console.log)

**Rationale**: Structured error handling and logging enable debugging and monitoring. Domain-specific errors communicate business failures clearly to consumers.

## Layer Architecture

### Forbidden Imports (Strictly Enforced)

- ❌ `infrastructure/controllers` → NEVER import into domain/application layers
- ❌ External framework code → NEVER import NestJS decorators in domain/application layers
- ❌ `node_modules` → NEVER import directly in domain/application layers (use interfaces)
- ✅ External libraries ONLY in infrastructure layer or via abstracted interfaces

### File Organization Standards

All file and folder names use **lowercase kebab-case**:
- Entities: `product.ts`, `auth-user.ts`
- Value objects: `price.ts`, `email.ts`
- Interfaces: `product-repository.interface.ts`
- Use cases: `get-products.use-case.ts`, `create-product.use-case.ts`
- Controllers: `product.controller.ts`
- DTOs: `create-product.dto.ts`, `product-filters.dto.ts`

## Testing Requirements

### Testing Strategy

- **Domain tests**: Pure unit tests with no mocks - test entities, value objects, business rules
- **Application tests**: Unit tests with mocked repositories and services - test orchestration
- **Controller tests**: Use NestJS testing utilities - test HTTP handling and DTO conversion
- **E2E tests**: Integration tests for complete user workflows

### Testing Priority Order

1. **Controllers** (API contracts) - Verify endpoints work correctly
2. **Use Cases** (Business orchestration) - Verify coordination logic
3. **Domain** (Business rules) - Verify business logic correctness

### Coverage Gates

All PRs MUST pass coverage thresholds:
- 95% lines/statements
- 90% branches/functions
- Generated via `npm run test:cov`

## Development Workflow

### Framework & Stack

- **Node.js**: 22.x or higher (required)
- **Framework**: NestJS 11 + TypeScript
- **Testing**: Jest
- **Build**: NestJS CLI (`npm run start:dev`)

### Available Commands

```bash
npm run start:dev      # Dev server with watch mode
npm run start:debug    # With debugging
npm run start:prod     # Production mode
npm run build          # Build for production
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:cov       # Coverage report
npm run test:e2e       # E2E tests
npm run lint           # ESLint check
```

### Code Review Requirements

All code reviews MUST verify:
- Layer boundaries respected (no forbidden imports)
- Test coverage meets thresholds (95% lines, 90% branches)
- Business logic only in domain layer
- Use cases have maximum 3 dependencies
- Entities are immutable
- All interfaces have `I` prefix
- All DTOs have `DTO` suffix
- Custom domain errors used appropriately

### Documentation Standards

Reference comprehensive guidelines in `.github/instructions/`:
- `hexagonal-architecture.instructions.md` - Layer principles and boundaries
- `folder-structure.instructions.md` - Project structure and organization
- `domain-layer.instructions.md` - Entities, value objects, contracts
- `application-layer.instructions.md` - Use cases and orchestration
- `infrastructure-layer.instructions.md` - Repositories, controllers, DI
- `naming-conventions.instructions.md` - File and code naming rules
- `testing-guidelines.instructions.md` - Testing strategy and patterns
- `mcp-context7.instructions.md` - Library documentation via MCP server

## Governance

This constitution supersedes all other development practices. Any violations MUST be justified with explicit rationale in PR description.

### Amendment Process

1. Propose amendment with rationale in PR
2. Update constitution.md with version bump (semantic versioning)
3. Update dependent templates and documentation
4. Generate Sync Impact Report
5. Require approval from project maintainers

### Version Policy

- **MAJOR**: Backward incompatible principle removals or redefinitions
- **MINOR**: New principle added or materially expanded guidance
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Verification

All PRs/reviews MUST:
- Verify layer boundaries respected
- Verify test coverage thresholds met
- Verify naming conventions followed
- Verify business logic isolated in domain layer
- Verify external libraries properly wrapped
- Verify interfaces use specific, domain-driven methods (not generic get/set)
- Reference `.github/copilot-instructions.md` for AI-assisted development

**Version**: 1.1.0 | **Ratified**: 2025-11-04 | **Last Amended**: 2025-11-04
