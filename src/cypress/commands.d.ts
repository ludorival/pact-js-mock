/// <reference types="cypress" />

import { Pact } from '../core'
import { PactFile } from '../types'

declare global {
  namespace Cypress {
    interface Chainable {
      writePact<P extends PactFile>(pact: Pact<P>): Chainable<void>
      reloadPact<P extends PactFile>(pact: Pact<P>): Chainable<any>
    }
  }
}
