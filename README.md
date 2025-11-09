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

## Getting started with MSW and Jest

Here is an example of how to use pact-js-mock with [MSW](https://mswjs.io/) using [Jest](https://jestjs.io/):

```js
import { setupServer, rest } from 'msw/node'
import { Pact } from 'pact-js-mock/lib/msw'

import { reloadPact, deletePact, writePact } from 'pact-js-mock/lib/utils'
import { writeFile } from 'fs'

const server = setupServer()

const pact = new Pact(
  {
    consumer: { name: 'test-consumer' },
    provider: { name: 'rest-provider' },
    metadata: { pactSpecification: { version: '2.0.0' } },
  },
  {
    outputDir: 'pacts', // the pact is written by default to pacts folder
  },
)

before(() => {
  server.listen()
  deletePact(pact)
})

beforeEach(function () {
  // set the current test name as the source of the pact
  pact.setCurrentSource(this.currentTest.title)
  reloadPact(pact)
})

afterEach(() => {
  server.resetHandlers()
  writePact(pact)
})

after(() => {
  server.close()
})

it('get all movies', async () => {
  const mockMovies = rest.get(
    '*/movies',
    pact.toResolver({
      description: 'a request to list all movies',
      response: [
        {
          id: 1,
          name: 'Movie 1',
          year: 2008,
        },
        {
          id: 2,
          name: 'Movie 2',
          year: 2008,
        },
      ],
    }),
  )

  server.use(mockMovies)

  const movies = await fetchMovies()

  expect(movies).toEqual([
    {
      id: 1,
      name: 'Movie 1',
      year: 2008,
    },
    {
      id: 2,
      name: 'Movie 2',
      year: 2008,
    },
  ])
})
```

You can find more example to mock

- [A Rest API](./src/msw/test/rest/rest.client.test.ts)
- [A GraphQL API](./src/msw/test/graphql/graphql.client.test.ts)

### Getting started with MSW and Mocha

Here is an example of how to use pact-js-mock with [MSW](https://mswjs.io/) using [Jest](https://jestjs.io/):

```js
import { setupServer, rest } from 'msw/node'
import { Pact } from 'pact-js-mock/lib/msw'

import { reloadPact, deletePact, writePact } from 'pact-js-mock/lib/utils'
import { writeFile } from 'fs'

const server = setupServer()

const pact = new Pact(
  {
    consumer: { name: 'test-consumer' },
    provider: { name: 'rest-provider' },
    metadata: { pactSpecification: { version: '2.0.0' } },
  },
  {
    outputDir: 'pacts', // the pact is written by default to pacts folder
  },
)

before(() => {
  server.listen()
  deletePact(pact)
})

beforeEach(function () {
  // set the current test name as the source of the pact
  pact.setCurrentSource(this.currentTest.title)
  reloadPact(pact)
})

afterEach(() => {
  server.resetHandlers()
  writePact(pact)
})

after(() => {
  server.close()
})

it('get all movies', async () => {
  const mockMovies = rest.get(
    '*/movies',
    pact.toResolver({
      description: 'a request to list all movies',
      response: [
        {
          id: 1,
          name: 'Movie 1',
          year: 2008,
        },
        {
          id: 2,
          name: 'Movie 2',
          year: 2008,
        },
      ],
    }),
  )

  server.use(mockMovies)

  const movies = await fetchMovies()

  expect(movies).toEqual([
    {
      id: 1,
      name: 'Movie 1',
      year: 2008,
    },
    {
      id: 2,
      name: 'Movie 2',
      year: 2008,
    },
  ])
})
```

## Getting started with Cypress

`pact-js-mock` ships with an auto-setup path for Cypress so you can record pacts with almost no boilerplate.

### 1. Import the Cypress support shim

Add a single import in your Cypress support file (for example `cypress/support/component.ts` or `cypress/support/e2e.ts`):

```ts
import 'pact-js-mock/lib/cypress'
```

This registers the `cy.pactIntercept()` command and wires the lifecycle hooks that read existing pacts before tests and write the updated files afterwards.

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
