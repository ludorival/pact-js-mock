/* eslint-disable @typescript-eslint/no-unused-vars */
import type from 'cypress'
import { InteractionFor, MinimalInteraction, PactFile } from '../types'
import { inferProviderName } from '../core'
import { pactRegistry } from './registry'
import type { Method } from 'cypress/types/net-stubbing'

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Intercept HTTP requests and record them as Pact interactions.
       *
       * Simplest usage - just pass the response body:
       * cy.pactIntercept('POST', '/order-service/v1/order', { id: 123 })
       *
       * For custom interactions (description, provider states, matching rules):
       * cy.pactIntercept('POST', '/order-service/v1/order', {
       *   description: 'create order',
       *   providerState: 'order service is available',
       *   response: { status: 201, body: { id: 123 } }
       * })
       *
       * @returns Chainable that can be used with .as() for aliasing
       */
      pactIntercept(
        method: Method,
        url: string | RegExp,
        responseOrInteraction:
          | unknown
          | MinimalInteraction<InteractionFor<PactFile>>,
      ): Chainable
    }
  }
}

function pactIntercept(
  method: Method,
  url: string | RegExp,
  responseOrInteraction: unknown | MinimalInteraction<InteractionFor<PactFile>>,
): Cypress.Chainable {
  const providerName = inferProviderName(url)

  const pactInstance = pactRegistry.getOrCreate(providerName)

  const handler = pactInstance.toHandler(
    responseOrInteraction as
      | MinimalInteraction<InteractionFor<PactFile, unknown>>
      | object,
  )

  return cy.intercept(method, url, handler)
}

Cypress.Commands.add('pactIntercept', pactIntercept)
