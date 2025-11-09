# Migration Guide: Cypress Integration v1.0 (Breaking Changes)

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
