/* eslint-disable @typescript-eslint/no-unused-vars */
import type from 'cypress'
import {
  InteractionFor,
  MinimalInteraction,
  PactFile,
} from '../types'
import { pactRegistry } from './registry'
import { Pact as CypressPact } from './pact'

/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Register a Pact instance for use in tests
       * @param pactOrName - Either a Pact instance (for default) or a name string
       * @param pact - Pact instance (required if first arg is a name)
       */
      registerPact<P extends PactFile>(
        pactOrName: CypressPact<P> | string,
        pact?: CypressPact<P>,
      ): Chainable<void>
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
       * @param method - HTTP method (GET, POST, etc.)
       * @param url - URL pattern to intercept
       * @param responseOrInteraction - Response body (simple usage) or full interaction object (advanced usage)
       * @returns Chainable that can be used with .as() for aliasing
       */
      pactIntercept(
        method: string,
        url: string | RegExp,
        responseOrInteraction: unknown | MinimalInteraction<InteractionFor<PactFile>>,
      ): Chainable
      /**
       * Overload for named pact: pactIntercept(pactName, method, url, responseOrInteraction)
       */
      pactIntercept(
        pactName: string,
        method: string,
        url: string | RegExp,
        responseOrInteraction: unknown | MinimalInteraction<InteractionFor<PactFile>>,
      ): Chainable
    }
  }
}

function registerPact<P extends PactFile>(
  pactOrName: CypressPact<P> | string,
  pact?: CypressPact<P>,
): void {
  if (typeof pactOrName === 'string') {
    // Named pact registration
    if (!pact) {
      throw new Error(
        'Pact instance is required when registering a named pact',
      )
    }
    pactRegistry.register(pactOrName, pact as CypressPact<PactFile>)
  } else {
    // Default pact registration
    pactRegistry.registerDefault(pactOrName as CypressPact<PactFile>)
  }
}

function pactIntercept(
  arg1: string,
  arg2: string | RegExp,
  arg3: unknown | MinimalInteraction<InteractionFor<PactFile>>,
  arg4?: unknown | MinimalInteraction<InteractionFor<PactFile>>,
): Cypress.Chainable {
  let pactName: string | undefined
  let method: string
  let url: string | RegExp
  let responseOrInteraction: unknown | MinimalInteraction<InteractionFor<PactFile>>

  // Determine which overload is being used
  if (arg4 !== undefined) {
    // Named pact: pactIntercept(pactName, method, url, responseOrInteraction)
    pactName = arg1
    method = arg2 as string
    url = arg3 as string | RegExp
    responseOrInteraction = arg4
  } else {
    // Default pact: pactIntercept(method, url, responseOrInteraction)
    method = arg1
    url = arg2
    responseOrInteraction = arg3
  }

  // Get the appropriate pact instance
  const pactInstance = pactName
    ? pactRegistry.get(pactName)
    : pactRegistry.getDefault()

  if (!pactInstance) {
    throw new Error(
      pactName
        ? `No pact registered with name "${pactName}". Use cy.registerPact() first.`
        : 'No default pact registered. Use cy.registerPact(pact) first.',
    )
  }

  // Convert response/interaction to handler
  // toHandler() automatically handles both simple response bodies and full interaction objects
  const handler = pactInstance.toHandler(responseOrInteraction)

  // Use cy.intercept with the handler and return the chainable
  return cy.intercept(method, url, handler)
}

Cypress.Commands.add('registerPact', registerPact)
Cypress.Commands.add('pactIntercept', pactIntercept)
