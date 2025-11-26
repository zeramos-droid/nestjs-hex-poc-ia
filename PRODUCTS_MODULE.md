# Products Module - Hexagonal Architecture

## 📋 Descripción

Módulo de gestión de productos implementado con arquitectura hexagonal (Ports & Adapters) siguiendo los principios de Domain-Driven Design (DDD).

## 🏗️ Arquitectura

```
src/
├── domain/                      # Capa de Dominio (Lógica de Negocio)
│   ├── contracts/              # Interfaces y contratos
│   │   ├── dtos/              # DTOs de dominio (interfaces puras)
│   │   ├── product-repository.interface.ts
│   │   └── *-use-case.interface.ts
│   ├── entities/              # Entidades de dominio
│   │   └── product.entity.ts
│   ├── value-objects/         # Objetos de valor
│   │   ├── price.value-object.ts
│   │   └── product-code.value-object.ts
│   └── errors/                # Errores de dominio
│       ├── product-not-found.error.ts
│       ├── duplicate-product-code.error.ts
│       ├── invalid-product-data.error.ts
│       ├── insufficient-stock.error.ts
│       └── product-not-available.error.ts
│
├── application/                # Capa de Aplicación (Casos de Uso)
│   ├── use-cases/
│   │   ├── create-product.use-case.ts
│   │   ├── get-product-by-id.use-case.ts
│   │   ├── get-products.use-case.ts
│   │   ├── update-product.use-case.ts
│   │   ├── delete-product.use-case.ts
│   │   └── update-stock.use-case.ts
│   └── config/
│       └── tokens.ts          # Tokens de DI (Symbol-based)
│
└── infrastructure/             # Capa de Infraestructura
    ├── orm/
    │   └── product.entity.ts  # Entidad TypeORM
    ├── repositories/
    │   └── product.repository.ts
    ├── controllers/
    │   └── product.controller.ts
    ├── dto/                   # DTOs de API (con validaciones)
    │   ├── create-product.dto.ts
    │   ├── update-product.dto.ts
    │   ├── product-filters.dto.ts
    │   ├── product-response.dto.ts
    │   └── update-stock.dto.ts
    ├── modules/
    │   └── product.module.ts
    └── migrations/
        └── 1732590000000-CreateProductsTable.ts
```

## 🚀 Endpoints REST

### Base URL: `/products`

#### 1. **Crear Producto**
```http
POST /products
Content-Type: application/json

{
  "name": "Laptop HP",
  "description": "Laptop de alto rendimiento",
  "price": 1500.00,
  "stock": 10,
  "sku": "LAP-HP-001",
  "categoryId": "electronics"
}
```

**Respuesta (201 Created):**
```json
{
  "id": "uuid",
  "name": "Laptop HP",
  "description": "Laptop de alto rendimiento",
  "sku": "LAP-HP-001",
  "price": 1500.00,
  "formattedPrice": "$1,500.00",
  "stock": 10,
  "categoryId": "electronics",
  "isActive": true,
  "isInStock": true,
  "isLowStock": false,
  "createdAt": "2024-11-26T...",
  "updatedAt": "2024-11-26T..."
}
```

#### 2. **Obtener Producto por ID**
```http
GET /products/{id}
```

#### 3. **Listar Productos con Filtros**
```http
GET /products?search=laptop&categoryId=electronics&minPrice=100&maxPrice=2000&isActive=true&inStock=true&page=1&pageSize=10&sortBy=price&sortOrder=ASC
```

**Query Parameters:**
- `search` (opcional): Búsqueda en nombre, descripción y SKU
- `categoryId` (opcional): Filtrar por categoría
- `minPrice` (opcional): Precio mínimo
- `maxPrice` (opcional): Precio máximo
- `isActive` (opcional): Filtrar por estado activo/inactivo
- `inStock` (opcional): Filtrar productos con stock
- `page` (opcional, default: 1): Número de página
- `pageSize` (opcional, default: 10): Tamaño de página
- `sortBy` (opcional, default: createdAt): Campo de ordenamiento (name, price, createdAt, updatedAt)
- `sortOrder` (opcional, default: DESC): Orden (ASC, DESC)

**Respuesta (200 OK):**
```json
{
  "data": [...],
  "page": 1,
  "pageSize": 10,
  "totalItems": 50,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

#### 4. **Actualizar Producto**
```http
PATCH /products/{id}
Content-Type: application/json

{
  "name": "Laptop HP Actualizada",
  "price": 1450.00,
  "isActive": true
}
```

#### 5. **Eliminar Producto**
```http
DELETE /products/{id}
```

**Respuesta (204 No Content)**

#### 6. **Actualizar Stock**
```http
PATCH /products/{id}/stock
Content-Type: application/json

{
  "quantity": 5,
  "operation": "increment"  // "increment" o "decrement"
}
```

## 🎯 Casos de Uso Implementados

### 1. CreateProductUseCase
- Valida que el SKU no exista
- Crea producto con UUID autogenerado
- Retorna DTO de respuesta

### 2. GetProductByIdUseCase
- Busca producto por ID
- Lanza `ProductNotFoundError` si no existe

### 3. GetProductsUseCase
- Aplica filtros de búsqueda
- Paginación
- Ordenamiento
- Retorna metadatos de paginación

### 4. UpdateProductUseCase
- Actualiza campos parcialmente
- Validación de existencia
- Actualizaciones inmutables

### 5. DeleteProductUseCase
- Validación de existencia
- Eliminación física

### 6. UpdateStockUseCase
- Incremento/Decremento de stock
- Validación de stock insuficiente
- Control de cantidades negativas

## 🔄 Métodos del Repositorio

El repositorio implementa 19 métodos:

### CRUD Básico
- `create(product: Product): Promise<Product>`
- `findById(id: string): Promise<Product | null>`
- `findBySku(sku: string): Promise<Product | null>`
- `findAll(filters: IProductFiltersDTO): Promise<IPaginationResultDTO>`
- `update(id: string, product: Product): Promise<Product>`
- `delete(id: string): Promise<void>`

### Validación
- `existsBySku(sku: string): Promise<boolean>`
- `existsBySkuExcludingId(sku: string, excludeId: string): Promise<boolean>`

### Operaciones por Categoría
- `findByCategory(categoryId: string): Promise<Product[]>`
- `findByCategoryPaginated(categoryId, page, pageSize): Promise<IPaginationResultDTO>`
- `countByCategory(categoryId: string): Promise<number>`
- `bulkUpdatePrices(categoryId: string, percentage: number): Promise<void>`

### Gestión de Stock
- `updateStock(productId: string, newStock: number): Promise<Product>`
- `incrementStock(productId: string, amount: number): Promise<Product>`
- `decrementStock(productId: string, amount: number): Promise<Product>`
- `findLowStockProducts(threshold: number): Promise<Product[]>`
- `findOutOfStockProducts(): Promise<Product[]>`

### Estado del Producto
- `activateProduct(productId: string): Promise<Product>`
- `deactivateProduct(productId: string): Promise<Product>`
- `countActiveProducts(): Promise<number>`

## 🗄️ Base de Datos

### Migración
```bash
# Ejecutar migración
npm run migration:run

# Revertir migración
npm run migration:revert
```

### Tabla: `products`

| Columna      | Tipo          | Restricciones          |
|--------------|---------------|------------------------|
| id           | UUID          | PRIMARY KEY            |
| name         | VARCHAR(255)  | NOT NULL               |
| description  | TEXT          | NOT NULL               |
| price        | DECIMAL(10,2) | NOT NULL               |
| stock        | INTEGER       | NOT NULL, DEFAULT 0    |
| sku          | VARCHAR(100)  | NOT NULL, UNIQUE       |
| categoryId   | VARCHAR(100)  | NOT NULL               |
| isActive     | BOOLEAN       | NOT NULL, DEFAULT true |
| createdAt    | TIMESTAMP     | NOT NULL, DEFAULT now()|
| updatedAt    | TIMESTAMP     | NOT NULL, DEFAULT now()|

### Índices
- `IDX_PRODUCTS_SKU` (sku)
- `IDX_PRODUCTS_CATEGORY_ID` (categoryId)
- `IDX_PRODUCTS_IS_ACTIVE` (isActive)
- `IDX_PRODUCTS_STOCK` (stock)
- `IDX_PRODUCTS_CREATED_AT` (createdAt)

## 🧪 Testing

```bash
# Unit tests (Domain + Application)
npm test

# Integration tests (Infrastructure)
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Dependencias

```json
{
  "@nestjs/common": "^11.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/swagger": "^8.0.7",
  "typeorm": "^0.3.20",
  "class-validator": "^0.14.1",
  "class-transformer": "^0.5.1"
}
```

## 🔐 Variables de Entorno

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=products_db

# TypeORM
TYPEORM_SYNC=false
TYPEORM_LOGGING=true

# Application
PORT=3000
```

## 📚 Documentación Swagger

Acceder a: `http://localhost:3000/api`

La documentación incluye:
- Todos los endpoints disponibles
- Schemas de request/response
- Códigos de estado HTTP
- Ejemplos de uso

## 🎨 Principios Aplicados

### Hexagonal Architecture
- **Domain Layer**: Lógica de negocio pura (TypeScript puro)
- **Application Layer**: Casos de uso (orchestration)
- **Infrastructure Layer**: Implementaciones concretas (TypeORM, NestJS)

### SOLID
- **Single Responsibility**: Cada clase tiene una única responsabilidad
- **Open/Closed**: Extensible sin modificar código existente
- **Liskov Substitution**: Interfaces intercambiables
- **Interface Segregation**: Interfaces específicas y cohesivas
- **Dependency Inversion**: Dependencias vía interfaces

### DDD
- **Entities**: Identidad única (Product)
- **Value Objects**: Sin identidad, inmutables (Price, ProductCode)
- **Domain Events**: Errores de dominio
- **Repositories**: Abstracción de persistencia
- **Use Cases**: Casos de uso del negocio

## 🚦 Códigos de Estado HTTP

| Código | Descripción                          |
|--------|--------------------------------------|
| 200    | OK - Operación exitosa               |
| 201    | Created - Producto creado            |
| 204    | No Content - Eliminación exitosa     |
| 400    | Bad Request - Datos inválidos        |
| 404    | Not Found - Producto no encontrado   |
| 409    | Conflict - SKU duplicado             |
| 500    | Internal Server Error - Error servidor|

## 🔄 Flujo de Datos

```
HTTP Request → Controller (Infrastructure)
    ↓
API DTO Validation (class-validator)
    ↓
Convert to Domain DTO
    ↓
Use Case (Application)
    ↓
Domain Entity + Business Rules
    ↓
Repository Interface (Domain Contract)
    ↓
Repository Implementation (Infrastructure)
    ↓
TypeORM Entity → PostgreSQL
    ↓
Response ← DTO Mapping ← Domain Entity
```

## 📝 Notas de Implementación

1. **Entity vs Value Objects**: El proyecto usa entidades con primitivos en lugar de value objects para simplificar la implementación
2. **Symbol-based DI**: Uso de `Symbol()` para tokens de inyección de dependencias
3. **Immutable Updates**: Métodos de entidad retornan nuevas instancias
4. **DTO Separation**: DTOs de dominio (interfaces) vs DTOs de API (classes con validación)
5. **Error Handling**: Errores de dominio convertidos a HttpException en controllers

## 🤝 Contribución

1. Crear feature branch: `git checkout -b feature/nueva-funcionalidad`
2. Seguir convenciones de commits: `feat:`, `fix:`, `refactor:`, `test:`
3. Mantener cobertura de tests > 95%
4. Actualizar documentación
5. Crear Pull Request

---

**Autor**: Zehiael Ramos
**Fecha**: Noviembre 2024
**Versión**: 1.0.0
