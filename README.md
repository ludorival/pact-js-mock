<h1 align="center">Welcome to pact-js-mock.msw 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/github/v/release/ludorival/pact-js-mock" />
  <a href="https://github.com/ludorival/pact-js-mock/#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/ludorival/pact-js-mock/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/ludorival/pact-js-mock/blob/master/LICENSE" target="_blank">
    <img alt="License: BSD--3--Clause" src="https://img.shields.io/github/license/ludorival/pact-js-mock" />
  </a>
</p>

# pact-js-mock

`pact-js-mock` is a Node.js library that allows you to build [Pact](https://docs.pact.io/) contracts by leveraging your existings mocks. It could be used with your existing mocks defined with [msw](https://mswjs.io/) or [Cypress](https://www.cypress.io/). This library provides an easy way to generate contracts that can be used for testing and verifying API interactions between consumer and provider.

## Install

```sh
yarn add -D pact-js-mock
```

## Getting started with MSW

`pact-js-mock` provides a simplified API for MSW that automatically records Pact interactions. Just use `pactHttp` and `pactGraphql` instead of MSW's `http` and `graphql` - they work exactly the same way!

### 1. Optional: Configure with `pact.config.json`

Create a `pact.config.json` file in your project root (optional):

```json
{
  "consumerName": "test-consumer",
  "pactVersion": "2.0.0",
  "outputDir": "./pacts"
}
```

If you don't create a config file, sensible defaults are used. Provider names are automatically inferred from request URLs.

### 2. Create your consumer contract

Creating a contract with `pact-js-mock` is straightforward - you can leverage your existing MSW mocks! Simply replace your MSW imports with `pact-js-mock`'s wrappers:

**REST API - Before:**

```ts
import { http, HttpResponse } from 'msw'
```

**REST API - After:**

```ts
import { pactHttp as http, HttpResponse } from 'pact-js-mock/lib/msw'
```

**GraphQL - Before:**

```ts
import { graphql, HttpResponse } from 'msw'
```

**GraphQL - After:**

```ts
import { pactGraphql as graphql, HttpResponse } from 'pact-js-mock/lib/msw'
```

That's it! Your existing MSW handlers will now automatically record Pact interactions. The API is identical to MSW, so no other changes are needed.

**REST API handlers:**

```ts
// handlers.ts
import { pactHttp as http, HttpResponse } from 'pact-js-mock/lib/msw'

// Simple handler - Pact recording happens automatically
export const getMovies = http.get('*/movies', () => {
  return HttpResponse.json([
    { id: 1, name: 'Movie 1', year: 2008 },
    { id: 2, name: 'Movie 2', year: 2008 },
  ])
})

// With Pact options (optional third parameter)
export const getMovieById = http.get(
  '*/movies/*',
  ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Movie 1',
      year: 2008,
    })
  },
  {
    providerState: 'a movie with the given id exists',
    description: 'a request to get a movie by id',
  },
)
```

**GraphQL handlers:**

```ts
// handlers.ts
import { pactGraphql as graphql, HttpResponse } from 'pact-js-mock/lib/msw'

// Query handler
export const getTodos = graphql.query('todos', () =>
  HttpResponse.json({
    data: {
      todos: [
        { id: '1', title: 'Buy groceries', completed: false },
        { id: '2', title: 'Do laundry', completed: true },
      ],
    },
  }),
)

// Mutation handler with Pact options
export const createTodo = graphql.mutation(
  'createTodo',
  () =>
    HttpResponse.json({
      data: {
        createTodo: { id: '1', title: 'New todo', completed: false },
      },
    }),
  {
    description: 'a request to create a new todo',
  },
)
```

### 3. Use in your tests

**⚠️ Important:** The following lifecycle hooks are **mandatory** for generating pact contract files with MSW. They ensure pact files are properly managed throughout your test suite.

**With Jest:**

```ts
import { setupServer } from 'msw/node'
import { getMovies } from './handlers'
import { pactRegistry } from 'pact-js-mock/lib/msw'
import {
  deletePacts,
  reloadPacts,
  writePacts,
  setCurrentSourceForPacts,
} from 'pact-js-mock/lib/utils'

const server = setupServer()

before(() => {
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

after(() => {
  server.close()
})

it('get all movies', async () => {
  server.use(getMovies)

  const movies = await fetchMovies()

  expect(movies).toEqual([
    { id: 1, name: 'Movie 1', year: 2008 },
    { id: 2, name: 'Movie 2', year: 2008 },
  ])
})
```

**With Mocha:**

```ts
import { setupServer } from 'msw/node'
import {
  pactHttp as http,
  HttpResponse,
  pactRegistry,
} from 'pact-js-mock/lib/msw'
import {
  deletePacts,
  reloadPacts,
  writePacts,
  setCurrentSourceForPacts,
} from 'pact-js-mock/lib/utils'

const server = setupServer()

before(() => {
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

after(() => {
  server.close()
})

it('get all movies', async () => {
  const mockMovies = http.get('*/movies', () =>
    HttpResponse.json([
      { id: 1, name: 'Movie 1', year: 2008 },
      { id: 2, name: 'Movie 2', year: 2008 },
    ]),
  )

  server.use(mockMovies)

  const movies = await fetchMovies()

  expect(movies).toEqual([
    { id: 1, name: 'Movie 1', year: 2008 },
    { id: 2, name: 'Movie 2', year: 2008 },
  ])
})
```

**Lifecycle hooks explained:**

- **`beforeAll` / `before`**: `deletePacts(registry)` - Cleans up existing pact files before running tests
- **`beforeEach`**:
  - `setCurrentSourceForPacts(registry, testName)` - Sets the current test name as the source for all pacts
  - `reloadPacts(registry)` - Reloads existing pact files to preserve interactions from previous tests
- **`afterEach`**: `writePacts(registry)` - Writes all pact files after each test to persist recorded interactions

### Key Features

- ✅ **Drop-in replacement** - Use `pactHttp` and `pactGraphql` exactly like MSW's `http` and `graphql`
- ✅ **Automatic Pact recording** - No need to manually create Pact instances or wrap resolvers
- ✅ **Zero boilerplate** - Just write standard MSW handlers
- ✅ **Optional configuration** - Use `pact.config.json` or rely on sensible defaults
- ✅ **GraphQL support** - Full support for queries, mutations, and operations

You can find complete examples:

- [REST API example](./src/msw/test/rest/rest.client.test.ts)
- [GraphQL API example](./src/msw/test/graphql/graphql.client.test.ts)

> **Note:** If you're using the old API with `Pact` instances and `toResolver()`, see the [Migration Guide](./MIGRATION_GUIDE.md#msw-integration-v10-simplified-api) for instructions on migrating to the new simplified API.

## Getting started with Cypress

`pact-js-mock` ships with an auto-setup path for Cypress so you can record pacts with almost no boilerplate.

### 1. Import the Cypress support shim

Add a single import in your Cypress support file (for example `cypress/support/component.ts` or `cypress/support/e2e.ts`):

```ts
import 'pact-js-mock/lib/cypress'
```

This registers the `cy.pactIntercept()` command and wires the lifecycle hooks that read existing pacts before tests and write the updated files afterwards.

> **Note:** If you are using TypeScript, make sure your `tsconfig.json` includes `["cypress/**/*.ts", "cypress/**/*.tsx"]`.

### 2. Register the plugin

To persist pact files across runs, wire the Pact plugin in your Cypress configuration. The example below uses the classic `cypress/plugins/index.js` entry:

```ts
// cypress.config.ts
import { defineConfig } from 'cypress'
import pactPlugin from 'pact-js-mock/lib/cypress/plugin'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return pactPlugin(on, config)
    },
  },
})
```

### 3. Write tests with `cy.pactIntercept()`

Use `cy.pactIntercept()` instead of `cy.intercept()`. You can pass either a plain response body or a full Pact interaction. Provider names are inferred from the URL, and pact files are generated automatically:

```ts
describe('todos', () => {
  it('lists all todos', () => {
    cy.pactIntercept('GET', '/todo-service/todos', [
      { id: '1', title: 'Buy milk' },
      { id: '2', title: 'Pay bills' },
    ]).as('todos')

    cy.visit('/todos')

    cy.wait('@todos').its('response').its('statusCode').should('eq', 200)
  })
})
```

You can find complete examples under:

- [REST component tests](./src/cypress/test/rest/rest.client.cy.tsx)
- [GraphQL component tests](./src/cypress/test/graphql/graphql.client.cy.tsx)

### 4. Customization

#### Plugin Configuration

You can customize the Pact plugin behavior by passing configuration options to the plugin in your `cypress.config.ts`:

```ts
// cypress.config.ts
import { defineConfig } from 'cypress'
import pactPlugin from 'pact-js-mock/lib/cypress/plugin'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      return pactPlugin(on, config, {
        consumerName: 'web-app',
        pactVersion: '4.0.0',
        outputDir: './pacts',
        options: {
          basePath: '/api',
          headersConfig: {
            includes: ['content-type', 'authorization'],
          },
        },
      })
    },
  },
})
```

**Configuration options:**

- `consumerName` (optional): Name of the consumer service. Defaults to the value from `pact.config.json` or `'my-consumer'`.
- `pactVersion` (optional): Pact specification version (`'2.0.0'`, `'3.0.0'`, or `'4.0.0'`). Defaults to `'2.0.0'`.
- `outputDir` (optional): Directory where pact files will be written. Defaults to `'./pacts'`.
- `options` (optional): Additional options:
  - `basePath`: Base path that will be stripped from URLs when recording interactions
  - `headersConfig`: Configuration for which headers to include/exclude in pact files:
    - `includes`: Array of header names to include (all others will be excluded). Use this to whitelist specific headers.
    - `excludes`: Array of header names to exclude (all others will be included). Use this to blacklist specific headers.
    - Note: Use either `includes` or `excludes`, not both
  - `ignoreConflict`: Whether to ignore conflicts when merging interactions

**Configuration priority:** Options are merged in the following priority order (highest to lowest):

1. Plugin configuration (passed to `pactPlugin`)
2. Cypress environment variables (`Cypress.env('pact')`)
3. `pact.config.json` file

#### Command-Level Customization

You can customize individual Pact interactions by passing `pactOptions` as the fourth parameter to `cy.pactIntercept()`:

```ts
cy.pactIntercept(
  'POST',
  '/order-service/v1/order',
  { statusCode: 201, body: { id: 123 } },
  {
    description: 'create a new order',
    providerState: 'order service is available',
    matchingRules: {
      body: {
        '$.id': { match: 'type' },
      },
    },
  },
)
```

**Pact interaction options:**

- `description` (optional): Human-readable description of the interaction
- `providerState` (optional): Provider state for Pact V2 (string)
- `providerStates` (optional): Provider states for Pact V3/V4 (array of objects or string)
- `matchingRules` (optional): Matching rules for request/response validation (Pact V3/V4)
- `generators` (optional): Generators for dynamic data in request/response (Pact V3/V4)
- `metadata` (optional): Additional metadata for the interaction

**Examples:**

```ts
// Simple usage with description and provider state
cy.pactIntercept(
  'GET',
  '/api/users/123',
  { id: 123, name: 'John' },
  {
    description: 'get user by id',
    providerState: 'user with id 123 exists',
  },
)

// Advanced usage with matching rules (Pact V3/V4)
cy.pactIntercept(
  'POST',
  '/api/orders',
  { statusCode: 201, body: { id: 123, createdAt: '2024-01-01' } },
  {
    description: 'create order',
    providerState: 'order service is available',
    matchingRules: {
      body: {
        '$.id': { match: 'type' },
        '$.createdAt': { match: 'regex', regex: '\\d{4}-\\d{2}-\\d{2}' },
      },
    },
  },
)

// Usage with provider states array (Pact V3/V4)
cy.pactIntercept('GET', '/api/products', [{ id: 1, name: 'Product' }], {
  description: 'list products',
  providerStates: [{ name: 'products exist', params: {} }],
})
```

## Author

👤 **Ludovic Dorival**

- Github: [@ludorival](https://github.com/ludorival)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Ludovic Dorival](https://github.com/ludorival).<br />
This project is [BSD--3--Clause](https://github.com/ludorival/pact-js-mock/msw/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
