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

**TypeScript Setup:** The type declarations for `cy.pactIntercept()` are automatically included when you import the module. **Most projects won't need any tsconfig changes** - TypeScript automatically processes type declarations from `node_modules` when modules are imported.

However, you **must ensure** your Cypress support file is included in your TypeScript compilation. Here's a minimal `tsconfig.json` for Cypress:

```json
{
  "compilerOptions": {
    "types": ["cypress", "node"],
    "moduleResolution": "node"
  },
  "include": ["cypress/**/*.ts", "cypress/**/*.tsx"]
}
```

**Key points:**

- ✅ The `include` array must contain your Cypress support files (where you import `pact-js-mock/lib/cypress`)
- ✅ `types: ["cypress"]` ensures Cypress types are available (usually already configured)
- ✅ `moduleResolution: "node"` is the default and allows TypeScript to resolve types from `node_modules`
- ✅ No special path mappings or configuration needed - TypeScript automatically processes types from imported modules

The global type augmentation will be available once you import `pact-js-mock/lib/cypress` in a file that TypeScript processes.

### 2. Register the plugin

To persist pact files across runs, wire the Pact plugin in your Cypress configuration. The example below uses the classic `cypress/plugins/index.js` entry:

```js
// cypress/plugins/index.js
const pactPlugin = require('pact-js-mock/lib/cypress/plugin').default

module.exports = (on, config) => {
  return pactPlugin(on, config, {
    consumerName: 'web-app',
    pactVersion: '4.0.0',
  })
}
```

If you're using the newer `setupNodeEvents` API inside `cypress.config.ts`, import the same plugin and return the value from `setupNodeEvents` instead.

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
      })
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

### Troubleshooting TypeScript Issues

**Quick Answer:** Most projects don't need tsconfig changes. TypeScript automatically processes type declarations from `node_modules`. The only requirement is that your Cypress support file (where you import `pact-js-mock/lib/cypress`) must be included in your `tsconfig.json` `include` array.

If TypeScript doesn't recognize `cy.pactIntercept()` in your project, try the following solutions:

#### Solution 1: Ensure Your Support File is Included in tsconfig.json

The most common issue is that the Cypress support file (where you import `pact-js-mock/lib/cypress`) is not included in your TypeScript compilation. Make sure your `tsconfig.json` includes your Cypress files:

```json
{
  "compilerOptions": {
    "types": ["cypress", "node"],
    "moduleResolution": "node"
  },
  "include": ["cypress/**/*.ts", "cypress/**/*.tsx"]
}
```

**Important:** If you have a separate `cypress/tsconfig.json`, ensure it extends your main config or includes the support files:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["cypress", "node"]
  },
  "include": ["../cypress/**/*.ts", "../cypress/**/*.tsx"]
}
```

#### Solution 2: Verify the Import is in Your Support File

Ensure you're importing `pact-js-mock/lib/cypress` in a file that's included in your TypeScript compilation. The import should be in your Cypress support file (e.g., `cypress/support/component.ts` or `cypress/support/e2e.ts`):

```ts
// cypress/support/component.ts or cypress/support/e2e.ts
import 'pact-js-mock/lib/cypress'
```

#### Solution 3: Create a Type Declaration File (Advanced)

If the above solutions don't work, you can create a type declaration file that explicitly imports the types:

```ts
// cypress/support/index.d.ts or cypress/support/e2e.d.ts
import 'pact-js-mock/lib/cypress'
```

This ensures TypeScript processes the type declarations. Make sure this file is included in your `tsconfig.json`:

```json
{
  "include": [
    "cypress/**/*.ts",
    "cypress/**/*.tsx",
    "cypress/support/**/*.d.ts"
  ]
}
```

#### Solution 4: Check Module Resolution and skipLibCheck

**Module Resolution:** If you're using a monorepo or have custom module resolution, ensure TypeScript can resolve the package. The default `moduleResolution: "node"` should work in most cases.

**skipLibCheck:** If your `tsconfig.json` has `skipLibCheck: true` (common for performance), this is fine - it won't prevent types from being available. However, if you're still having issues, you can try temporarily setting it to `false` to see if it helps with type resolution.

**Monorepo path mappings:** If you're in a monorepo and TypeScript can't resolve the package, you might need path mappings (though this is rarely necessary):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "pact-js-mock/*": ["node_modules/pact-js-mock/lib/*"]
    }
  }
}
```

The type declarations use global augmentation, so once the module is imported in a file that TypeScript processes, the `cy.pactIntercept()` command should be available throughout your Cypress tests.

#### Solution 5: Verify TypeScript Version

Ensure you're using a modern TypeScript version (4.1+). Older versions may have issues with global type augmentations from `node_modules`. You can check your version with:

```bash
npx tsc --version
```

If you're using an older version, consider updating to TypeScript 4.5+ for better support of type declarations from `node_modules`.

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
