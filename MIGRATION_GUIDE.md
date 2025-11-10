# Migration Guide

This guide covers migration instructions for both **Cypress Integration** and **MSW Integration** updates.

---

# Cypress Integration v1.0 (Breaking Changes)

## Overview

This is a **major version update** with breaking changes that simplify the Cypress integration API. The new API removes backward compatibility to provide the simplest possible developer experience.

## Breaking Changes

### 1. Removed Commands

The following commands have been **removed**:

- `cy.writePact()` - Now handled automatically
- `cy.reloadPact()` - Now handled automatically

### 2. Automatic Lifecycle Management

You no longer need to manually manage lifecycle hooks. The following are now handled automatically:

- Reloading pacts before tests
- Setting test source/title for each test
- Writing pacts after tests

### 3. Simplified Import

**Old approach:**

```typescript
import 'pact-js-mock/lib/cypress/commands'
```

**New approach:**

```typescript
import 'pact-js-mock/lib/cypress' // Auto-setup everything
```

## Migration Steps

### Step 1: Update Your Support File

**Before (`cypress/support/component.ts`):**

```typescript
import 'pact-js-mock/lib/cypress/commands'
```

**After:**

```typescript
import 'pact-js-mock/lib/cypress'
```

### Step 2: Update Your Test Files

**Before:**

```typescript
import { pact } from './handlers'

before(() => {
  cy.reloadPact(pact)
})

beforeEach(() => {
  pact.setCurrentSource(Cypress.currentTest.title)
})

after(() => {
  cy.writePact(pact)
})

describe('My tests', () => {
  it('should work', () => {
    cy.intercept(
      'GET',
      '/api/endpoint',
      pact.toHandler({
        description: 'get data',
        response: { status: 200, body: { id: 123 } },
      }),
    )
  })
})
```

**After:**

```typescript
import { pact } from './handlers'

describe('My tests', () => {
  it('should work', () => {
    // Simplest usage - just pass the response body
    cy.pactIntercept('GET', '/api/endpoint', { id: 123 })
  })
})
```

### Step 3: Simplify Your Intercepts

The new `cy.pactIntercept()` command works just like `cy.intercept()` but automatically records pact interactions.

**Simplest usage (most common):**

```typescript
// Just pass the response body directly
cy.pactIntercept('POST', '/order-service/v1/order', { id: 123 })
cy.pactIntercept('GET', '/api/todos', [])
cy.pactIntercept('GET', '/api/user', {
  name: 'John',
  email: 'john@example.com',
})
```

**Advanced usage (when you need customization):**

```typescript
// Pass a full interaction object for custom descriptions, provider states, etc.
cy.pactIntercept('POST', '/order-service/v1/order', {
  description: 'create order successfully',
  providerState: 'order service is available',
  response: { status: 201, body: { id: 123 } },
})
```

## New API Summary

### Commands

| Command                                   | Description                           |
| ----------------------------------------- | ------------------------------------- |
| `cy.pactIntercept(method, url, response)` | Intercept and record pact interaction |

### Key Features

✅ **Automatic lifecycle management** - No more manual hooks  
✅ **Simplest possible API** - Works like `cy.intercept()` with pact recording  
✅ **Flexible** - Pass simple response bodies or full interaction objects  
✅ **Auto-setup** - Single import configures everything

## Examples

### REST API Example

```typescript
import 'pact-js-mock/lib/cypress'
import { pact } from './handlers'

cy.registerPact(pact)

describe('Todo API', () => {
  it('should get todos', () => {
    cy.pactIntercept('GET', '/api/todos', [
      { id: 1, title: 'Buy milk' },
      { id: 2, title: 'Walk dog' },
    ]).as('getTodos')

    cy.visit('/')
    cy.wait('@getTodos')
  })

  it('should create todo with 201 status', () => {
    cy.pactIntercept('POST', '/api/todos', {
      description: 'create todo successfully',
      response: {
        status: 201,
        body: { id: 1, title: 'New todo' },
      },
    }).as('createTodo')

    cy.get('#create-button').click()
    cy.wait('@createTodo')
  })
})
```

### GraphQL API Example

```typescript
import 'pact-js-mock/lib/cypress'
import { pact } from './handlers'

cy.registerPact(pact)

describe('GraphQL API', () => {
  it('should query users', () => {
    cy.pactIntercept('POST', '/graphql', {
      data: {
        users: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ],
      },
    }).as('queryUsers')

    cy.visit('/')
    cy.wait('@queryUsers')
  })
})
```

## Configuration (Optional)

You can optionally use the `withPact()` helper to simplify your `cypress.config.ts`:

**Before:**

```typescript
import pactPlugin from 'pact-js-mock/lib/cypress/plugin'

export default defineConfig({
  component: {
    setupNodeEvents(on, config) {
      return pactPlugin(on, config)
    },
  },
})
```

**After:**

```typescript
import pactPlugin from 'pact-js-mock/lib/cypress/plugin'

export default defineConfig({
  component: {
    setupNodeEvents(on, config) {
      return pactPlugin(on, config, {
        consumerName: 'web-app',
        pactVersion: '4.0.0',
      })
    },
  },
})
```

## Benefits

| Before                                | After                  |
| ------------------------------------- | ---------------------- |
| 4+ manual setup steps                 | 1 import               |
| 3 lifecycle hooks per test file       | 0 (automatic)          |
| `cy.intercept()` + `pact.toHandler()` | `cy.pactIntercept()`   |
| Complex interaction objects           | Simple response bodies |
| 30+ lines of boilerplate              | 2 lines                |

## Troubleshooting

### Tests not recording interactions

Ensure you've imported `pact-js-mock/lib/cypress` in your support file (`cypress/support/component.ts`).

### TypeScript errors

The new API requires TypeScript. Make sure your test files use `.ts` or `.tsx` extensions.

## Questions?

For more examples, see:

- `src/cypress/test/rest/rest.client.cy.tsx`
- `src/cypress/test/graphql/graphql.client.cy.tsx`

---

# MSW Integration v1.0 (Simplified API)

## Overview

This update significantly simplifies the API for using `pact-js-mock` with MSW (Mock Service Worker). The new API eliminates the need for manual Pact instance creation and resolver wrapping, making it much more developer-friendly.

## Key Changes

### 1. Simplified Handler API

You no longer need to:

- Create `Pact` instances manually
- Use `pact.toResolver()` or `toResolver(pact, ...)` wrappers
- Manage Pact configuration in handler files

### 2. New Wrapper Functions

- **`pactHttp`** - Drop-in replacement for MSW's `http` with automatic Pact recording
- **`pactGraphql`** - New GraphQL support with `query`, `mutation`, and `operation` methods

### 3. Automatic Pact Management

- Provider names are automatically inferred from request URLs
- Pact instances are managed via a registry
- Interactions are recorded automatically without blocking responses

## Migration Steps

### Step 1: Update Your Imports

**Before:**

```typescript
import { http } from 'msw'
import { graphql } from 'msw'
import { Pact } from '../../pact'
import { toResolver, toResponse } from '../../handler'
```

**After:**

```typescript
import { pactHttp as http, pactGraphql as graphql, HttpResponse } from '../../'
// or
import { pactHttp, pactGraphql, HttpResponse } from '../../'
```

### Step 2: Remove Pact Instance Creation

**Before:**

```typescript
export const pact = new Pact(
  {
    consumer: { name: 'test-consumer' },
    provider: { name: 'todo-service' },
    metadata: { pactSpecification: { version: '2.0.0' } },
  },
  {
    basePath: '/todo-service',
    headersConfig: {
      includes: ['content-type'],
    },
  },
)
```

**After:**

```typescript
// No Pact instance needed! Configuration is handled automatically via registry
// Optionally, you can create a pact.config.json file in your project root:
```

**Option 1: Use `pact.config.json` (Recommended)**

Create a `pact.config.json` file in your project root:

```json
{
  "consumerName": "test-consumer",
  "pactVersion": "2.0.0",
  "options": {
    "basePath": "/todo-service",
    "headersConfig": {
      "includes": ["content-type"]
    }
  }
}
```

This configuration is automatically read by the registry and used for all handlers.

**Option 2: No configuration file**

If you don't create a config file, the registry uses sensible defaults:

- `consumerName`: `"my-consumer"`
- `pactVersion`: `"2.0.0"`
- Provider names are automatically inferred from request URLs

### Step 3: Update REST API Handlers

**Before:**

```typescript
import { http } from 'msw'
import { Pact } from '../../pact'

const pact = new Pact({
  consumer: { name: 'test-consumer' },
  provider: { name: 'todo-service' },
  metadata: { pactSpecification: { version: '2.0.0' } },
})

export const emptyTodos = http.get(
  '*/todo-service/todos',
  pact.toResolver({
    description: 'empty todo list',
    response: {
      status: 200,
      body: [],
    },
  }),
)

export const todoByIdFound = http.get(
  '*/todo-service/todos/*',
  pact.toResolver({
    description: 'should found a todo item by its id',
    providerState: 'there is an existing todo item with this id',
    response: {
      status: 200,
      body: {
        id: '1',
        title: 'Buy groceries',
      },
    },
  }),
)
```

**After:**

```typescript
import { pactHttp as http, HttpResponse } from '../../'

// Simple handler - Pact recording happens automatically
export const emptyTodos = http.get('*/todo-service/todos', () => {
  return HttpResponse.json([])
})

// With Pact options (optional third parameter)
export const todoByIdFound = http.get(
  '*/todo-service/todos/*',
  () => {
    return HttpResponse.json({
      id: '1',
      title: 'Buy groceries',
    })
  },
  {
    providerState: 'there is an existing todo item with this id',
    description: 'should found a todo item by its id',
  },
)
```

### Step 4: Update GraphQL Handlers

**Before:**

```typescript
import { graphql } from 'msw'
import { Pact } from '../../pact'
import { toResolver, toResponse } from '../../handler'

const pact = new Pact({
  consumer: { name: 'test-consumer' },
  provider: { name: 'graphql-provider' },
  metadata: { pactSpecification: { version: '2.0.0' } },
})

export const emptyTodos = graphql.query(
  'todos',
  pact.toResolver({
    description: 'empty todo list',
    response: {
      status: 200,
      body: {
        data: {
          todos: [],
        },
      },
    },
  }),
)

export const createTodo = graphql.mutation('createTodo', async (info) =>
  toResponse(
    pact,
    {
      description: 'should create a Todo with success',
      response: {
        status: 200,
        body: {
          data: {
            createTodo: {
              id: '1',
              title: 'Buy groceries',
            },
          },
        },
      },
    },
    info,
  ),
)
```

**After:**

```typescript
import { pactGraphql as graphql, HttpResponse } from '../../'

// Query handler
export const emptyTodos = graphql.query('todos', () =>
  HttpResponse.json({ data: { todos: [] } }),
)

// Mutation handler with Pact options
export const createTodo = graphql.mutation(
  'createTodo',
  () =>
    HttpResponse.json({
      data: {
        createTodo: {
          id: '1',
          title: 'Buy groceries',
        },
      },
    }),
  {
    description: 'should create a Todo with success',
  },
)
```

### Step 5: Update Test Lifecycle Hooks

**⚠️ Important:** The following lifecycle hooks are **mandatory** for generating pact contract files with MSW. They ensure pact files are properly managed throughout your test suite.

**Before:**

```typescript
import { setupServer } from 'msw/node'
import { Pact } from '../../pact'
import { reloadPact, deletePact, writePact } from '../../utils'

const pact = new Pact({
  consumer: { name: 'test-consumer' },
  provider: { name: 'todo-service' },
  metadata: { pactSpecification: { version: '2.0.0' } },
})

beforeAll(() => {
  server.listen()
  deletePact(pact)
})

beforeEach(function () {
  pact.setCurrentSource(this.currentTest.title)
  reloadPact(pact)
})

afterEach(() => {
  server.resetHandlers()
  writePact(pact)
})

afterAll(() => {
  server.close()
})
```

**After:**

```typescript
import { setupServer } from 'msw/node'
import { pactRegistry } from 'pact-js-mock/lib/msw'
import {
  deletePacts,
  reloadPacts,
  writePacts,
  setCurrentSourceForPacts,
} from 'pact-js-mock/lib/utils'

const server = setupServer()

beforeAll(() => {
  // Delete all existing pact files before starting tests
  deletePacts(pactRegistry)
  server.listen()
})

beforeEach(function () {
  // Set the current test name as the source for all pacts
  setCurrentSourceForPacts(pactRegistry, this.currentTest?.title)
  // Reload existing pact files (if any) to preserve previous interactions
  reloadPacts(pactRegistry)
})

afterEach(() => {
  // Write all pact files after each test to persist interactions
  writePacts(pactRegistry)
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
```

**Key differences:**

- **`deletePact(pact)` → `deletePacts(pactRegistry)`** - Now works with the registry to delete all pact files
- **`pact.setCurrentSource()` → `setCurrentSourceForPacts(pactRegistry, testName)`** - Sets source for all pacts in the registry
- **`reloadPact(pact)` → `reloadPacts(pactRegistry)`** - Reloads all pacts from the registry
- **`writePact(pact)` → `writePacts(pactRegistry)`** - Writes all pacts from the registry

**Lifecycle hooks explained:**

- **`beforeAll` / `before`**: `deletePacts(registry)` - Cleans up existing pact files before running tests
- **`beforeEach`**:
  - `setCurrentSourceForPacts(registry, testName)` - Sets the current test name as the source for all pacts
  - `reloadPacts(registry)` - Reloads existing pact files to preserve interactions from previous tests
- **`afterEach`**: `writePacts(registry)` - Writes all pact files after each test to persist recorded interactions

## Complete Examples

### REST API Handlers

```typescript
import { pactHttp as http, HttpResponse } from '../../'

// Simple GET handler
export const emptyTodos = http.get('*/todo-service/todos', () => {
  return HttpResponse.json([])
})

// GET with Pact options
export const todoByIdFound = http.get(
  '*/todo-service/todos/*',
  () => HttpResponse.json({ id: '1', title: 'Buy groceries' }),
  {
    providerState: 'there is an existing todo item with this id',
    description: 'should found a todo item by its id',
  },
)

// POST handler
export const createTodoWillSucceed = http.post(
  '*/todo-service/todos',
  async () => {
    return HttpResponse.json(
      {
        id: '1',
        title: 'Buy groceries',
        description: 'Milk, bread, eggs, cheese',
        completed: false,
      },
      { status: 201 },
    )
  },
)

// Error response
export const todoByIdNotFound = http.get('*/todo-service/todos/*', () => {
  return HttpResponse.json({ message: 'Todo not found' }, { status: 404 })
})
```

### GraphQL Handlers

```typescript
import { pactGraphql as graphql, HttpResponse } from '../../'

// Query handler
export const emptyTodos = graphql.query('todos', () =>
  HttpResponse.json({ data: { todos: [] } }),
)

// Query with data
export const multipleTodos = graphql.query('todos', () =>
  HttpResponse.json({
    data: {
      todos: [
        { id: '1', title: 'Buy groceries', completed: false },
        { id: '2', title: 'Do laundry', completed: true },
      ],
    },
  }),
)

// Mutation handler
export const createTodoWillSucceed = graphql.mutation('createTodo', () =>
  HttpResponse.json({
    data: {
      createTodo: {
        id: '1',
        title: 'Buy groceries',
        completed: false,
      },
    },
  }),
)

// Query with Pact options
export const todoByIdFound = graphql.query(
  'todoById',
  () =>
    HttpResponse.json({
      data: {
        todoById: {
          id: '1',
          title: 'Buy groceries',
        },
      },
    }),
  {
    providerState: 'there is an existing todo item with this id',
    description: 'should found a todo item by its id',
  },
)

// GraphQL error response
export const todoByIdNotFound = graphql.query('todoById', () =>
  HttpResponse.json({
    errors: [{ message: 'The todo item 1 is not found' }],
  }),
)
```

## API Reference

### `pactHttp`

Works exactly like MSW's `http` but with automatic Pact recording:

```typescript
pactHttp.get(url, resolver, options?)
pactHttp.post(url, resolver, options?)
pactHttp.put(url, resolver, options?)
pactHttp.patch(url, resolver, options?)
pactHttp.delete(url, resolver, options?)
pactHttp.head(url, resolver, options?)
pactHttp.options(url, resolver, options?)
```

### `pactGraphql`

GraphQL-specific handlers with automatic Pact recording:

```typescript
pactGraphql.query(operationName, resolver, options?)
pactGraphql.mutation(operationName, resolver, options?)
pactGraphql.operation(resolver, options?)
pactGraphql.link(url) // Scoped handlers for specific GraphQL endpoints
```

### Pact Options (Optional Third Parameter)

When you need to customize Pact interactions:

```typescript
{
  description?: string
  providerState?: string
  providerStates?: Array<{ name: string; params?: Record<string, unknown> }>
  matchingRules?: Record<string, unknown>
  generators?: Record<string, unknown>
  metadata?: Record<string, unknown>
}
```

## Benefits

| Before                                 | After                  |
| -------------------------------------- | ---------------------- |
| Manual Pact instance creation          | Automatic via registry |
| `pact.toResolver({ response: {...} })` | Standard MSW handlers  |
| Complex interaction objects            | Simple response bodies |
| 20+ lines per handler file             | 2-5 lines per handler  |
| No GraphQL support                     | Full GraphQL support   |

## Backward Compatibility

The old API with `Pact` instances and `toResolver()` methods still works, but we recommend migrating to the new simplified API for better developer experience.

## Configuration

Pact configuration is now handled via a registry system. You can configure global settings using a `pact.config.json` file in your project root.

### Using `pact.config.json`

Create a `pact.config.json` file in your project root:

```json
{
  "consumerName": "test-consumer",
  "pactVersion": "2.0.0",
  "outputDir": "./pacts",
  "options": {
    "basePath": "/todo-service",
    "headersConfig": {
      "includes": ["content-type"]
    }
  }
}
```

**Configuration options:**

- `consumerName` (string, default: `"my-consumer"`) - Name of the consumer service
- `pactVersion` (string, default: `"2.0.0"`) - Pact specification version (`"2.0.0"`, `"3.0.0"`, or `"4.0.0"`)
- `outputDir` (string, optional) - Directory where pact files will be written
- `options` (object, optional) - Additional options:
  - `basePath` (string) - Base path for requests
  - `headersConfig` (object) - Header configuration:
    - `includes` (string[]) - List of headers to include in pact interactions

**Provider names** are automatically inferred from request URLs (e.g., `*/todo-service/*` → provider: `"todo-service"`), so you don't need to configure them manually.

## Troubleshooting

### Provider name not detected correctly

Provider names are inferred from the URL path. If you need custom provider names, you can configure them via the registry.

### Pact interactions not being recorded

Ensure you're using `pactHttp` or `pactGraphql` instead of the standard MSW `http` or `graphql` imports.

### TypeScript errors

Make sure you're importing from the correct path. The wrappers are exported from the main index file.

## Questions?

For more examples, see:

- `src/msw/test/rest/handlers.ts`
- `src/msw/test/graphql/handlers.ts`
