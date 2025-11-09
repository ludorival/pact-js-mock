/* eslint-disable @typescript-eslint/no-unused-vars */
import type from 'cypress'
import type {
  CyHttpMessages,
  RouteHandlerController,
  StaticResponse,
} from 'cypress/types/net-stubbing'
import { Pact } from '../core'
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
      writePact<P extends PactFile>(pact: Pact<P>): Chainable<void>
      reloadPact<P extends PactFile>(pact: Pact<P>): Chainable<void>
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
       * Intercept HTTP requests and record them as Pact interactions
       * @param method - HTTP method (GET, POST, etc.)
       * @param url - URL pattern to intercept
       * @param interaction - Interaction definition or response body
       * @param pactName - Optional name of registered pact (uses default if not provided)
       * @returns Chainable that can be used with .as() for aliasing
       */
      pactIntercept<P extends PactFile>(
        method: string,
        url: string | RegExp,
        interaction: MinimalInteraction<InteractionFor<P>> | unknown,
        pactName?: string,
      ): Chainable
      /**
       * Overload for named pact: pactIntercept(pactName, method, url, interaction)
       */
      pactIntercept<P extends PactFile>(
        pactName: string,
        method: string,
        url: string | RegExp,
        interaction: MinimalInteraction<InteractionFor<P>> | unknown,
      ): Chainable
    }
  }
}

function writePact<P extends PactFile>(pact: Pact<P>): void {
  cy.writeFile(pact.fileName, pact.generatePactFile())
}

function reloadPact<P extends PactFile>(pact: Pact<P>) {
  cy.task('readPact', pact.fileName).then((pactFile) =>
    pact.reset(pactFile as P),
  )
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

function pactIntercept<P extends PactFile>(
  arg1: string,
  arg2: string | RegExp,
  arg3: string | MinimalInteraction<InteractionFor<P>> | unknown,
  arg4?: MinimalInteraction<InteractionFor<P>> | unknown,
): Cypress.Chainable {
  let pactName: string | undefined
  let method: string
  let url: string | RegExp
  let interaction: MinimalInteraction<InteractionFor<P>> | unknown

  // Determine which overload is being used
  if (arg4 !== undefined) {
    // Named pact: pactIntercept(pactName, method, url, interaction)
    pactName = arg1
    method = arg2 as string
    url = arg3 as string | RegExp
    interaction = arg4
  } else {
    // Default pact: pactIntercept(method, url, interaction)
    method = arg1
    url = arg2
    interaction = arg3
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

  // Convert interaction to handler
  const handler = (pactInstance as CypressPact<P>).toHandler(interaction)

  // Use cy.intercept with the handler and return the chainable
  return cy.intercept(method, url, handler)
}

Cypress.Commands.add('writePact', writePact)
Cypress.Commands.add('reloadPact', reloadPact)
Cypress.Commands.add('registerPact', registerPact)
Cypress.Commands.add('pactIntercept', pactIntercept)
