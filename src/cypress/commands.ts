/// <reference path="./commands.d.ts" />

import { Pact } from '../core'
import { PactFile } from '../types'

function writePact<P extends PactFile>(pact: Pact<P>): void {
  cy.writeFile(pact.fileName, pact.generatePactFile())
}

function reloadPact<P extends PactFile>(pact: Pact<P>) {
  cy.task('readPact', pact.fileName).then((pactFile) =>
    pact.reset(pactFile as P),
  )
}
Cypress.Commands.add('writePact', writePact)

Cypress.Commands.add('reloadPact', reloadPact)
