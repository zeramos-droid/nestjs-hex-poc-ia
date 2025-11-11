---
applyTo: '**'
---

# Naming Conventions

## Code/Symbols Naming (PascalCase or camelCase)

- **Interfaces**: Always start with `I` prefix
  - Examples: `IProductService`, `IProductRepository`, `IUserRepository`
  
- **DTOs**: Start with `I` and end with `DTO`
  - Examples: `ICreateProductDTO`, `IProductResponseDTO`, `IUpdateUserDTO`
  
- **Classes**: Use PascalCase
  - Examples: `Product`, `ProductService`, `Price`, `Email`
  
- **Functions/Methods**: Use camelCase
  - Examples: `createProduct`, `getUser`, `validateEmail`, `calculateTotal`
  
- **Entities**: Use `_entity` schema pattern
  - Example: `private readonly _entity: IProductSchema`
  
- **Value Objects**: Also use `_entity` schema pattern
  - Example: `private readonly _entity: IPriceSchemaValueObject`

## File Names (kebab-case)

All file and folder names use **lowercase kebab-case**:

### Domain Files

- **Entities**: `product.ts`, `auth-user.ts`, `shopping-cart.ts`
- **Value Objects**: `price.ts`, `email.ts`, `product-code.ts`
- **Interfaces**: `product-service.interface.ts`, `user-repository.interface.ts`, `user-dto.interface.ts`
- **DTOs**: `product.dto.ts`, `create-user.dto.ts`

### Application Files

- **Use Cases**: `get-products.use-case.ts`, `create-product.use-case.ts`, `update-user.use-case.ts`

### Infrastructure Files

- **Repositories**: `product.repository.ts`, `in-memory-user.repository.ts`, `postgres-order.repository.ts`
- **External Services**: `stripe-payment.service.ts`, `aws-s3.service.ts`
- **Controllers**: `product.controller.ts`, `user.controller.ts`, `order.controller.ts`
- **DTOs**: `create-product.dto.ts`, `product-filters.dto.ts`, `product-response.dto.ts`

## Architecture-Specific Rules

- **Use Cases**: One class = One `execute()` method; name describes action (e.g., `GetProductsUseCase`, `CreateOrderUseCase`)
- **Generic Interface**: All use cases extend `IUseCase<TInput, TOutput>`
- **Interfaces**: Always use `.interface.ts` suffix for contract files
- **DTOs**: Always use `.dto.ts` suffix for data transfer object files
- **Controllers**: Always use `.controller.ts` suffix for REST/GraphQL endpoints

## Examples by Layer

### Domain Layer
```
domain/
├── contracts/
│   ├── product-service.interface.ts
│   ├── product-repository.interface.ts
│   └── create-product.dto.ts
├── entities/
│   ├── product.ts
│   └── category.ts
├── value-objects/
│   ├── price.ts
│   └── product-code.ts
└── errors/
    ├── product-not-found.error.ts
    └── invalid-price.error.ts
```

### Application Layer
```
application/
├── use-cases/
│   ├── get-products.use-case.ts
│   ├── get-product-by-id.use-case.ts
│   ├── create-product.use-case.ts
│   └── update-product.use-case.ts
└── config/
    └── tokens.ts
```

### Infrastructure Layer
```
infrastructure/
├── repositories/
│   └── platzi-product.repository.ts
├── external-services/
│   └── stripe-payment.service.ts
├── controllers/
│   └── product.controller.ts
├── dto/
│   ├── create-product.dto.ts
│   └── product-filters.dto.ts
└── {module-name}.module.ts
```
