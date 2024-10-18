<h1 align="center">Welcome to pact-mock-js.msw 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/github/v/release/ludorival/pact-mock-js" />
  <a href="https://github.com/ludorival/pact-mock-js/#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/ludorival/pact-mock-js/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/ludorival/pact-mock-js/blob/master/LICENSE" target="_blank">
    <img alt="License: BSD--3--Clause" src="https://img.shields.io/github/license/ludorival/pact-mock-js" />
  </a>
</p>

# pact-mock-js

`pact-mock-js` is a Node.js library that allows you to build [Pact](https://docs.pact.io/) contracts by leveraging your existings mocks. It could be used with your existing mocks defined with [msw](https://mswjs.io/) or [Cypress](https://www.cypress.io/). This library provides an easy way to generate contracts that can be used for testing and verifying API interactions between consumer and provider.

## Install

```sh
yarn add -D pact-mock-js
```

## Getting started with MSW

Here is an example of how to use pact-mock-js with [MSW](https://mswjs.io/):

```js
import { setupServer, rest } from 'msw/node'
import { Pact } from 'pact-mock-js.msw'
import { writeFile } from 'fs'

const server = setupServer()

const pact = new Pact({
  consumer: { name: 'test-consumer' },
  provider: { name: 'rest-provider' },
  metadata: { pactSpecification: { version: '2.0.0' } },
})

beforeAll(() => {
  server.listen()
  pact.reset()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
  // Write the pact file wherever you want
  fs.writeFile(
    `pacts/${pact.name}.json`,
    JSON.stringify(pact.generatePactFile())
  )
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
    })
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

## Getting started with Cypress

Here is an example of how to use pact-mock-js with [Cypress](https://www.cypress.io/):

```js
import { Pact } from 'pact-mock-js/cypress'

const server = setupServer()

const pact = new Pact({
  consumer: { name: 'test-consumer' },
  provider: { name: 'rest-provider' },
  metadata: { pactSpecification: { version: '2.0.0' } },
})

beforeAll(() => {
  pact.reset()
})

afterAll(() => {
  // Write the pact file wherever you want
  cy.writeFile(`pacts/${pact.name}.json`, pact.generatePactFile())
})

it('get all movies', async () => {
  // intercept and mock the movies response while record the interaction
  cy.intercept(
    'GET',
    `/*/movies`,
    pact.toHandler({
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
    })
  ).as('multipleMovies')

  // open the page to test
  cy.visit('/')

  // add your assertions
  cy.wait('@multipleMovies')
    .its('response')
    .its('statusCode')
    .should('be.equal', 200)
})
```

You can find more example to mock

- [A Rest API](./src/cypress/test/rest/rest.client.cy.tsx)
- [A GraphQL API](./src/cypress/test/graphql/graphql.client.cy.tsx)

## Author

👤 **Ludovic Dorival**

- Github: [@ludorival](https://github.com/ludorival)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Ludovic Dorival](https://github.com/ludorival).<br />
This project is [BSD--3--Clause](https://github.com/ludorival/pact-mock-js/msw/blob/master/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
