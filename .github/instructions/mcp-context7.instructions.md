---
applyTo: '**'
---

# Context7 MCP Server Integration

## Overview

This project uses the **Context7 MCP Server** configured in `.vscode/mcp.json` for up-to-date library documentation and code examples.

## Configuration

```json
{
  "servers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "${env:CONTEXT7_API_KEY}"
      }
    }
  }
}
```

**Required:** Set `CONTEXT7_API_KEY` environment variable.

## When to Use

Use the Context7 MCP server throughout the entire project for:
- **Domain Layer** - Understanding TypeScript patterns, validation libraries (after wrapping in interfaces)
- **Application Layer** - Service patterns, NestJS decorators, dependency injection
- **Infrastructure Layer** - External library APIs (HTTP clients, databases, cloud services, ORMs)
- **Testing** - Jest, NestJS testing utilities, test patterns
- **General Development** - TypeScript, NestJS 11 documentation

## Available Features

### 1. Get Library Documentation
- Up-to-date API documentation for npm packages
- Official library guides and best practices
- Version-specific documentation

### 2. Find Code Examples
- Real-world code examples from official sources
- Framework-specific patterns (NestJS, TypeScript)
- Integration examples between libraries

### 3. Learn Best Practices
- Recommended patterns for each library
- Performance optimization tips
- Security best practices

## Usage by Layer

### Domain Layer

**Use Context7 for:**
- TypeScript advanced patterns (generics, conditional types, utility types)
- Immutability patterns and functional programming concepts
- Understanding design patterns for domain modeling

**Example Workflow:**
```
1. Use MCP: "Get TypeScript generics documentation"
2. Apply patterns in domain entities and value objects
```

### Application Layer

**Use Context7 for:**
- NestJS service patterns and dependency injection
- Use case orchestration patterns
- Application-level error handling
- DTO transformation patterns

**Example Workflow:**
```
Use MCP: "Get NestJS dependency injection documentation"
Use MCP: "Get NestJS use case patterns"
```

### Infrastructure Layer

**Use Context7 for:**
- HTTP client libraries (Axios, fetch)
- Database clients (Prisma, Drizzle, MongoDB)
- Cloud service SDKs (AWS SDK, Stripe, SendGrid)
- Authentication libraries (NextAuth, JWT)

**Example Workflow:**
```
1. Use MCP: "Get Axios documentation for HTTP requests"
2. Create interface in shared module:
   // shared/communication/domain/contracts/http-client.interface.ts
   interface IHttpClient {
     get<T>(url: string): Promise<IHttpResponse<T>>;
   }
3. Implement with Axios in infrastructure:
   // shared/communication/infrastructure/axios-http-client.ts
   class AxiosHttpClient implements IHttpClient { ... }
```

## Common Use Cases

### 1. Learning Framework Features

**NestJS 11:**
```
Use MCP: "Get NestJS 11 dependency injection documentation"
Use MCP: "Get NestJS 11 controllers and decorators examples"
Use MCP: "Get NestJS 11 middleware and guards documentation"
```

**TypeScript:**
```
Use MCP: "Get TypeScript generics documentation"
Use MCP: "Get TypeScript decorators documentation"
Use MCP: "Get TypeScript utility types examples"
```

### 2. Integrating External Libraries

**Before using any external library:**

1. **Get documentation:**
   ```
   Use MCP: "Get [library-name] documentation"
   ```

2. **Create interface wrapper (if needed in domain/application):**
   ```typescript
   // shared/{module}/domain/contracts/{interface}.interface.ts
   export interface ILibraryWrapper {
     // Define contract
   }
   ```

3. **Implement in infrastructure:**
   ```typescript
   // shared/{module}/infrastructure/{implementation}.ts
   import externalLibrary from 'external-library'; // OK here!
   
   export class LibraryImplementation implements ILibraryWrapper {
     // Implement using external library
   }
   ```

### 3. Understanding TypeScript Patterns

```
Use MCP: "Get TypeScript generics documentation"
Use MCP: "Get TypeScript utility types examples"
Use MCP: "Get TypeScript conditional types documentation"
```

### 4. Testing Patterns

```
Use MCP: "Get Jest mock documentation"
Use MCP: "Get NestJS testing utilities examples"
Use MCP: "Get Jest coverage configuration documentation"
```

## Workflow Examples

### Example 1: Adding HTTP Client

```
Step 1: Get documentation
Use MCP: "Get fetch API documentation"
Use MCP: "Get Axios documentation"

Step 2: Create interface (shared module)
// shared/communication/domain/contracts/http-client.interface.ts
export interface IHttpClient {
  get<T>(url: string): Promise<IHttpResponse<T>>;
  post<T>(url: string, data: unknown): Promise<IHttpResponse<T>>;
}

Step 3: Implement (infrastructure)
// shared/communication/infrastructure/fetch-http-client.ts
export class FetchHttpClient implements IHttpClient {
  async get<T>(url: string): Promise<IHttpResponse<T>> {
    const response = await fetch(url);
    const data = await response.json();
    return { data, status: response.status };
  }
}

Step 4: Use in module (via DI)
// modules/products/application/use-cases/get-products.use-case.ts
constructor(private httpClient: IHttpClient) {} // Interface only!
```

### Example 2: Adding Email Service

```
Step 1: Get documentation
Use MCP: "Get Nodemailer documentation"

Step 2: Create interface (shared module)
// shared/email/domain/contracts/email-service.interface.ts
export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendTemplateEmail(to: string, templateId: string, data: Record<string, unknown>): Promise<void>;
}

Step 3: Implement (infrastructure)
// shared/email/infrastructure/nodemailer-email-service.ts
import nodemailer from 'nodemailer'; // OK in infrastructure!

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  
  constructor(config: IEmailConfig) {
    this.transporter = nodemailer.createTransport(config);
  }
  
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.transporter.sendMail({ to, subject, html: body });
  }
}

Step 4: Use in module (via DI)
// Use cases receive IEmailService, not concrete implementation
constructor(private emailService: IEmailService) {}
```

## Important Rules

✅ **DO:**
- Use Context7 to understand library APIs before implementing
- Create interface wrappers for external libraries used in domain/application
- Implement wrappers in shared modules' infrastructure layer
- Use Context7 for framework-specific documentation (NestJS, TypeScript)
- Check version-specific documentation (NestJS 11, TypeScript)

❌ **DON'T:**
- Import external libraries directly in domain/application layers
- Skip creating interface wrappers for node_modules dependencies
- Use Context7 as a substitute for proper abstraction
- Forget to specify library versions when searching
- Import implementation details into domain layer

## Best Practices

### 1. Version-Specific Queries
Always specify versions when querying:
```
✅ "Get NestJS 11 dependency injection documentation"
✅ "Get TypeScript 5.x decorators documentation"
❌ "Get NestJS documentation" (may return old version)
```

### 2. Framework-Specific Patterns
Ask for framework-specific examples:
```
✅ "Get NestJS 11 guards and interceptors examples"
✅ "Get NestJS 11 custom decorators patterns"
```

### 3. Integration Patterns
Ask about library combinations:
```
"Get examples of using Prisma with NestJS 11"
"Get examples of using TypeORM with NestJS 11"
```

## Environment Setup

Make sure to set the API key:

```bash
# Add to .env.local or .zshrc/.bashrc
export CONTEXT7_API_KEY="your-api-key-here"
```

## Resources

- **Context7 Website**: https://context7.com
- **MCP Documentation**: https://modelcontextprotocol.io
- **API Key**: Required from Context7 service
