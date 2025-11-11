---
applyTo: '**/infrastructure/**'
---

# Infrastructure Layer Guidelines

## Core Principles

- **Framework-agnostic** - No frontend frameworks
- **Class-based OOP allowed** - Unlike domain/application layers
- **Implement contracts only** - Implement domain interfaces
- **External integrations** - Handle APIs, databases, external services
- **NestJS modules** - Use .module.ts files for dependency injection

## Repositories

### Repository Pattern
```typescript
// Repository implementation
export class PlatziProductRepository implements IProductRepository {
  constructor(private readonly httpClient: IHttpClient) {}

  async getProducts(filters: IProductFiltersDTO): Promise<IPaginationResult<Product>> {
    const { page, pageSize, search, minPrice, maxPrice } = filters;
    const offset = (page - 1) * pageSize;

    try {
      // Call external API
      const response = await this.httpClient.get<IPlatziProductDTO[]>(
        `/products?offset=${offset}&limit=${pageSize}`
      );

      // Map DTOs to domain entities
      const products = response.data.map(dto => this.mapToDomainEntity(dto));

      // Client-side filtering if needed
      let filteredProducts = products;
      if (search) {
        filteredProducts = filteredProducts.filter(p =>
          p.title.toLowerCase().includes(search.toLowerCase())
        );
      }
      if (minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
      }
      if (maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
      }

      const total = filteredProducts.length;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: filteredProducts,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      throw new ProductFetchError('Failed to fetch products from API');
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await this.httpClient.get<IPlatziProductDTO>(`/products/${id}`);
      return this.mapToDomainEntity(response.data);
    } catch (error) {
      throw new ProductNotFoundError(id);
    }
  }

  // Map external DTO to domain entity
  private mapToDomainEntity(dto: IPlatziProductDTO): Product {
    return Product.create(
      dto.id.toString(),
      dto.title,
      dto.price,
      dto.description,
      dto.images,
      dto.category?.name || 'Uncategorized',
      new Date(dto.creationAt),
      new Date(dto.updatedAt)
    );
  }
}
```

### Repository Rules
- **Implement domain contracts** - Implement `IRepository` interfaces
- **Return entities** - Always return domain entities, never DTOs
- **Map external data** - Convert external DTOs to domain entities
- **Handle errors** - Throw domain errors (e.g., `ProductNotFoundError`)
- **Use DI** - Receive dependencies via constructor (e.g., `IHttpClient`)
- **Framework-agnostic** - No frontend framework code

## External Services

### External Service Pattern
```typescript
// External service interface (in domain/contracts/)
interface IPaymentService {
  processPayment(amount: number, currency: string): Promise<IPaymentResultDTO>;
}

// External service implementation (in infrastructure/)
export class StripePaymentService implements IPaymentService {
  constructor(
    private readonly apiKey: string,
    private readonly httpClient: IHttpClient
  ) {}

  async processPayment(amount: number, currency: string): Promise<IPaymentResultDTO> {
    try {
      const response = await this.httpClient.post('/payments', {
        amount,
        currency,
        apiKey: this.apiKey,
      });

      return {
        transactionId: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
      };
    } catch (error) {
      throw new PaymentProcessingError('Failed to process payment');
    }
  }
}
```

### External Service Rules
- **Implement contracts** - Implement domain interfaces
- **Encapsulate logic** - Hide external API details
- **Error handling** - Convert external errors to domain errors
- **Configuration** - Accept config via constructor
- **Type-safe** - Use proper TypeScript types

## Dependency Injection with NestJS Modules

### NestJS Module Pattern (CRITICAL)

**All use cases and services MUST use `@Injectable()` decorator:**

```typescript
// application/config/tokens.ts - Dependency injection tokens
export const PRODUCT_TOKENS = {
  PRODUCT_REPOSITORY: Symbol('IProductRepository'),
  GET_PRODUCTS_USE_CASE: Symbol('IGetProductsUseCase'),
  GET_PRODUCT_BY_ID_USE_CASE: Symbol('IGetProductByIdUseCase'),
};

export const INFRASTRUCTURE_TOKENS = {
  HTTP_CLIENT: Symbol('IHttpClient'),
  LOGGER: Symbol('ILogger'),
};

// application/use-cases/get-products.use-case.ts - Use case with @Injectable()
import { Inject, Injectable } from '@nestjs/common';
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

// infrastructure/app.module.ts - NestJS DI configuration with Symbols
import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { PlatziProductRepository } from './repositories/platzi-product.repository';
import { FetchHttpClient } from './http-client/fetch-http-client';
import { GetProductsUseCase } from '../application/use-cases/get-products.use-case';
import { GetProductByIdUseCase } from '../application/use-cases/get-product-by-id.use-case';
import { PRODUCT_TOKENS, INFRASTRUCTURE_TOKENS } from '../application/config/tokens';

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
    },
    {
      provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
      useClass: GetProductsUseCase,  // ✅ No inject array needed - @Injectable() handles it
    },
    {
      provide: PRODUCT_TOKENS.GET_PRODUCT_BY_ID_USE_CASE,
      useClass: GetProductByIdUseCase,  // ✅ NestJS resolves dependencies automatically
    },
  ],
})
export class AppModule {}
```

### DI Rules (MANDATORY)
- **Symbol-based tokens** - Use Symbol() for dependency injection tokens (in `application/config/tokens.ts`)
- **@Injectable() decorator** - REQUIRED on all use cases, repositories, and services
- **@Inject() with Symbols** - Use `@Inject(TOKEN)` for constructor parameters
- **useClass pattern** - Use `useClass` without inject array (NestJS auto-resolves via `@Injectable()`)
- **NO factory functions** - Never use `useFactory` - it bypasses NestJS DI container
- **Interface types** - Tokens represent interface types (use `type` imports in constructors)
- **Type-safe** - Use proper TypeScript types

### Why @Injectable() is Mandatory

**✅ CORRECT:**
```typescript
@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}
}

// Module configuration - simple!
{
  provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
  useClass: GetProductsUseCase,
}
```

**❌ WRONG:**
```typescript
// Missing @Injectable() decorator
export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}
}

// Module configuration - complex and error-prone
{
  provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
  useFactory: (repo: IProductRepository) => new GetProductsUseCase(repo),
  inject: [PRODUCT_TOKENS.PRODUCT_REPOSITORY],
}
```

**Benefits:**
- ✅ NestJS manages lifecycle automatically
- ✅ Dependencies auto-resolved via reflection
- ✅ Cleaner module configuration
- ✅ Type-safe refactoring
- ✅ Easier testing (NestJS Test utilities work seamlessly)

## HTTP Client

### HTTP Client Pattern (Shared Module)
```typescript
// shared/communication/domain/contracts/http-client.interface.ts
export interface IHttpClient {
  get<T>(url: string, config?: IHttpConfig): Promise<IHttpResponse<T>>;
  post<T>(url: string, data?: unknown, config?: IHttpConfig): Promise<IHttpResponse<T>>;
  put<T>(url: string, data?: unknown, config?: IHttpConfig): Promise<IHttpResponse<T>>;
  delete<T>(url: string, config?: IHttpConfig): Promise<IHttpResponse<T>>;
}

// shared/communication/infrastructure/http-client/fetch-http-client.ts
export class FetchHttpClient implements IHttpClient {
  constructor(private readonly baseURL?: string) {}

  async get<T>(url: string, config?: IHttpConfig): Promise<IHttpResponse<T>> {
    const response = await fetch(this.buildURL(url), {
      method: 'GET',
      headers: config?.headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  async post<T>(url: string, data?: unknown, config?: IHttpConfig): Promise<IHttpResponse<T>> {
    const response = await fetch(this.buildURL(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    return {
      data: responseData,
      status: response.status,
      headers: response.headers,
    };
  }

  private buildURL(url: string): string {
    if (this.baseURL) {
      return `${this.baseURL}${url}`;
    }
    return url;
  }
}
```

## File Organization

```
infrastructure/
├── repositories/
│   ├── platzi-product.repository.ts       # Repository implementation
│   └── in-memory-user.repository.ts       # In-memory repository
├── services/
│   └── nest-config-environment.service.ts # Environment service
├── external-services/
│   ├── stripe-payment.service.ts          # External service
│   └── aws-s3-storage.service.ts          # External service
├── controllers/
│   ├── health.controller.ts               # Health check endpoint
│   └── product.controller.ts              # REST/GraphQL endpoints
├── dto/
│   ├── health-response.dto.ts             # API response DTO
│   ├── create-product.dto.ts              # API request DTO
│   └── product-filters.dto.ts             # API query DTO
└── app.module.ts                          # Main NestJS module configuration
```

## Controllers

### Controller Pattern
```typescript
// infrastructure/controllers/product.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param, 
  Inject,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { IGetProductsUseCase } from '../../domain/contracts/get-products-use-case.interface';
import type { IGetProductByIdUseCase } from '../../domain/contracts/get-product-by-id-use-case.interface';
import type { ICreateProductUseCase } from '../../domain/contracts/create-product-use-case.interface';
import { PRODUCT_TOKENS } from '../../application/config/tokens';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductFiltersDto } from '../dto/product-filters.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import type { IProductFiltersDTO } from '../../domain/contracts/dtos/product-filters.dto';
import type { ICreateProductDTO } from '../../domain/contracts/dtos/create-product.dto';

@Controller('products')
export class ProductController {
  constructor(
    @Inject(PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE)
    private readonly getProductsUseCase: IGetProductsUseCase,
    @Inject(PRODUCT_TOKENS.GET_PRODUCT_BY_ID_USE_CASE)
    private readonly getProductByIdUseCase: IGetProductByIdUseCase,
    @Inject(PRODUCT_TOKENS.CREATE_PRODUCT_USE_CASE)
    private readonly createProductUseCase: ICreateProductUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProducts(@Query() filtersDto: ProductFiltersDto): Promise<ProductResponseDto[]> {
    // Convert API DTO to Domain DTO
    const domainFilters: IProductFiltersDTO = {
      page: filtersDto.page,
      pageSize: filtersDto.pageSize,
      search: filtersDto.search,
    };
    
    // Call use case with Domain DTO
    const result = await this.getProductsUseCase.execute(domainFilters);
    
    // Return result (or map to specific response DTO if needed)
    return result;
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getProductById(@Param('id') id: string): Promise<ProductResponseDto> {
    return await this.getProductByIdUseCase.execute(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() createDto: CreateProductDto): Promise<ProductResponseDto> {
    // Convert API DTO to Domain DTO
    const domainDto: ICreateProductDTO = {
      name: createDto.name,
      price: createDto.price,
      description: createDto.description,
    };
    
    // Call use case with Domain DTO
    return await this.createProductUseCase.execute(domainDto);
  }
}
```

### Controller Rules
- **Use NestJS decorators** - @Controller, @Get, @Post, @Inject, etc.
- **Use HttpStatus enum** - Always use `HttpStatus.OK`, `HttpStatus.CREATED`, `HttpStatus.NO_CONTENT` instead of magic numbers
- **Use @HttpCode decorator** - Explicitly define response status codes for clarity
- **Import types with 'import type'** - For interfaces used in constructor injection with @Inject()
- **DTO conversion** - Convert API DTOs to Domain DTOs before calling use cases
- **DI with tokens** - Inject use cases using Symbol tokens
- **Interface types** - Type constructor parameters with interfaces, not classes
- **Thin controllers** - Just HTTP handling, no business logic

### HTTP Status Code Guidelines

**Use HttpStatus enum for all status codes:**
```typescript
import { HttpStatus, HttpCode } from '@nestjs/common';

// Success responses
@HttpCode(HttpStatus.OK)              // 200 - GET, PUT, PATCH successful
@HttpCode(HttpStatus.CREATED)         // 201 - POST successful (resource created)
@HttpCode(HttpStatus.NO_CONTENT)      // 204 - DELETE successful (no response body)

// Client error responses
throw new HttpException('Not found', HttpStatus.NOT_FOUND);           // 404
throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);       // 400
throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);     // 401
throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);           // 403
throw new HttpException('Conflict', HttpStatus.CONFLICT);             // 409

// Server error responses
throw new HttpException('Internal error', HttpStatus.INTERNAL_SERVER_ERROR); // 500
```

**Rationale**: Using `HttpStatus` enum makes code self-documenting, prevents magic numbers, ensures consistency across the codebase, and makes it easier to understand HTTP semantics at a glance.

## What NOT to Do

❌ **Never** return DTOs from repositories (return entities)  
❌ **Never** skip error handling  
❌ **Never** create singletons unless necessary  
❌ **Never** hard-code configuration (use constructor injection)  
❌ **Never** test infrastructure services (always mock in tests)  
❌ **Never** import external libraries directly in domain/application (use interfaces)
