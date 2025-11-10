/* eslint-disable @typescript-eslint/no-unused-vars */
import type from 'cypress'
import { inferProviderName } from '../core'
import { toHandler } from './handler'
import { pactRegistry } from './registry'
import type { PactInteractionOptions } from '../types'
import type { Method, StaticResponse } from 'cypress/types/net-stubbing'

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Intercept HTTP requests and record them as Pact interactions.
       *
       * This command has the same signature as cy.intercept() but adds an optional
       * parameter for Pact interaction customization.
       *
       * Simplest usage - just pass the response (matches cy.intercept):
       * cy.pactIntercept('POST', '/order-service/v1/order', { statusCode: 201, body: { id: 123 } })
       * cy.pactIntercept('GET', '/api/users', { fixture: 'users.json' })
       * cy.pactIntercept('POST', '/api/data', { body: { id: 123 } })
       *
       * With Pact interaction customization:
       * cy.pactIntercept(
       *   'POST',
       *   '/order-service/v1/order',
       *   { statusCode: 201, body: { id: 123 } },
       *   {
       *     description: 'create order',
       *     providerState: 'order service is available',
       *     matchingRules: { body: { '$.id': { match: 'type' } } }
       *   }
       * )
       *
       * @param method - HTTP method
       * @param url - URL pattern to match
       * @param response - Response (StaticResponse, fixture, or body) - same as cy.intercept
       * @param pactOptions - Optional Pact interaction customization options
       * @returns Chainable that can be used with .as() for aliasing
       */
      pactIntercept(
        method: Method,
        url: string | RegExp,
        response: StaticResponse | string | object,
        pactOptions?: PactInteractionOptions,
      ): Chainable
    }
  }
}

function pactIntercept(
  method: Method,
  url: string | RegExp,
  response: StaticResponse | string | object,
  pactOptions?: PactInteractionOptions,
): Cypress.Chainable {
  const providerName = inferProviderName(url)

  const pactInstance = pactRegistry.getOrCreate(providerName)

  const handler = toHandler(pactInstance, response, pactOptions)

  return cy.intercept(method, url, handler)
}

Cypress.Commands.add('pactIntercept', pactIntercept)
