# Contributing Guide

## Overview

This guide describes our development workflow using Speckit for feature development in this NestJS Hexagonal Architecture project. Follow these steps to contribute effectively to the codebase.

---

## Step-by-Step Workflow

### Step 1: Create Specification from User Story

**Who**: Product Owner provides the user story  
**Command**: `speckit.specify prompt`

**User Story Format**:
```markdown
# Historia de usuario [ID]: [Título]

**Como** [tipo de usuario],
**Quiero** [objetivo/acción],
**Para** [beneficio/valor].

## Criterios de Aceptación

**Escenario 1: [Nombre del escenario]**
- **Dado que** [contexto inicial],
- **Cuando** [acción del usuario],
- **Entonces** [resultado esperado],
- **Y** [resultado adicional],
- **Y** [resultado adicional].

**Escenario 2: [Nombre del escenario]**
...
```

**Action**: 
1. Run `speckit.specify prompt`
2. Paste the complete user story
3. Review generated file: `.specify/specs/{feature-name}.spec.md`

**Output**: Specification files ready for team review

---

### Step 2: Tech Team Reviews Specification

**Who**: Tech Team (Tech Lead + Senior Developers)

**Action**:
1. Read `.specify/specs/{feature-name}.spec.md`
2. Validate business requirements
3. Identify technical constraints
4. Check hexagonal architecture fit

**Output**: Approved specification

---

### Step 3: Create Technical Plan

**Who**: Tech Team  
**Command**: `speckit.plan`

**Action**:
1. Run `speckit.plan`
2. Add technical details:
   - Domain entities and value objects
   - Use cases (IUseCase<TInput, TOutput>)
   - Repository interfaces
   - Controller endpoints
   - DI tokens (Symbol-based)
   - Testing strategy
3. Review plan with team

**Output**: `.specify/plans/{feature-name}.plan.md` - Approved technical plan

---

### Step 4: Break Down into Tasks

**Who**: Tech Team  
**Command**: `speckit.tasks`

**Action**:
1. Run `speckit.tasks`
2. Organize tasks by layers:
   - **Domain Layer** (entities, value objects, interfaces)
   - **Application Layer** (use cases, DI tokens)
   - **Infrastructure Layer** (repositories, controllers, DTOs)
   - **Testing** (controller tests, use case tests, domain tests, E2E)

**Output**: `.specify/tasks/{feature-name}.tasks.md` - Task breakdown

---

### Step 5: Implement Features

**Who**: Developers  
**Command**: `speckit.implement`

**Action**:
1. Run `speckit.implement`
2. Follow test-first approach:
   - ✅ Controller tests first (Test.createTestingModule)
   - ✅ Use case tests (mock repositories)
   - ✅ Domain tests (no mocks)
   - ✅ E2E tests
3. Implement code following architecture guidelines
4. Run tests continuously: `npm run test:watch`
5. Check coverage: `npm run test:cov` (95%+ lines, 90%+ branches)

**Must Follow**:
- Use `@Injectable()` on all use cases
- Use `@Inject(TOKEN)` with Symbol tokens
- Use `HttpStatus` enum (no magic numbers)
- Keep domain layer pure (no framework imports)
- Max 3 dependencies per use case

**Output**: Working code with tests

---

### Step 6: Monitor & Validate

**Who**: Tech Team (Tech Lead + QA)

**Action**:
1. Run validation commands:
   ```bash
   npm run test          # All tests
   npm run test:cov      # Coverage report
   npm run test:e2e      # E2E tests
   npm run lint          # Code quality
   npm run build         # Production build
   ```

2. Verify checklist:
   - [ ] All tests passing
   - [ ] Coverage ≥ 95% (lines/statements), 90% (branches/functions)
   - [ ] Zero ESLint errors
   - [ ] Architecture compliance
   - [ ] All acceptance criteria met
   - [ ] Code review approved

3. Manual testing of acceptance criteria
4. Get Product Owner approval

**Output**: Production-ready feature

---

## Visual Workflow

```
User Story (Product Owner)
           ↓
   [1] speckit.specify prompt
           ↓
    Specification File
           ↓
   [2] Tech Team Review
           ↓
   [3] speckit.plan
           ↓
    Technical Plan
           ↓
   [4] speckit.tasks
           ↓
      Task Breakdown
           ↓
   [5] speckit.implement
           ↓
    Implementation + Tests
           ↓
   [6] Validate & Monitor
           ↓
   Production Deployment
```

---

## Quick Commands Reference

```bash
# Step 1: Generate specification
speckit.specify prompt

# Step 3: Generate technical plan  
speckit.plan

# Step 4: Generate tasks
speckit.tasks

# Step 5: AI-assisted implementation
speckit.implement

# Step 6: Validation
npm run test           # Run all tests
npm run test:cov       # Coverage report
npm run test:e2e       # E2E tests
npm run lint           # Linting
npm run build          # Production build
```

---

## Critical Rules

### ✅ Always Do
- Use `@Injectable()` on use cases, repositories, services
- Use `@Inject(SYMBOL_TOKEN)` for dependency injection
- Use `HttpStatus.OK`, `HttpStatus.CREATED` (never 200, 201)
- Test-first: Controllers → Use Cases → Domain → E2E
- Maintain 95%+ test coverage

### ❌ Never Do
- Import NestJS in domain/application layers
- Import external libraries directly in domain/application
- Use magic numbers for HTTP status codes
- Skip tests or reduce coverage
- Use `useFactory` (always use `useClass`)

---

**Version**: 1.0.0  
**Last Updated**: November 4, 2025
