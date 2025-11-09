/* eslint-disable @typescript-eslint/no-unused-vars */
import type from 'cypress'
import { InteractionFor, MinimalInteraction, PactFile } from '../types'
import { pactRegistry } from './registry'
import { Pact as CypressPact, createConfiguredPact } from './pact'
import { inferProviderName } from './provider'

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
        method: string,
        url: string | RegExp,
        responseOrInteraction:
          | unknown
          | MinimalInteraction<InteractionFor<PactFile>>,
      ): Chainable
    }
  }
}

function pactIntercept(
  method: string,
  url: string | RegExp,
  responseOrInteraction: unknown | MinimalInteraction<InteractionFor<PactFile>>,
): Cypress.Chainable {
  const providerName = inferProviderName(url)

  const pactInstance = pactRegistry.getOrCreate(providerName)

  // Convert response/interaction to handler
  // toHandler() automatically handles both simple response bodies and full interaction objects
  const handler = pactInstance.toHandler(responseOrInteraction as any)

  // Use cy.intercept with the handler and return the chainable
  return cy.intercept(method as any, url, handler)
}

Cypress.Commands.add('pactIntercept', pactIntercept)
