import { PactFile } from '../types'
import { pactRegistry } from './registry'
import { Pact } from './pact'

/**
 * Automatically manages Pact lifecycle hooks for Cypress tests
 */
export function setupLifecycleHooks(): void {
  // Track if hooks have been set up to avoid duplicate registration
  if ((Cypress as any).__pactLifecycleSetup) {
    return
  }
  ;(Cypress as any).__pactLifecycleSetup = true

  // Reload pacts before all tests
  before(() => {
    const pacts = pactRegistry.getAll()
    pacts.forEach((pact) => {
      cy.task('readPact', pact.fileName).then((pactFile) => {
        if (pactFile) {
          pact.reset(pactFile as PactFile)
        }
      })
    })
  })

  // Set current source before each test
  beforeEach(function () {
    const pacts = pactRegistry.getAll()
    const testTitle = this.currentTest?.title || Cypress.currentTest?.title
    if (testTitle) {
      pacts.forEach((pact) => {
        pact.setCurrentSource(testTitle)
      })
    }
  })

  // Write pacts after all tests
  after(() => {
    const pacts = pactRegistry.getAll()
    pacts.forEach((pact) => {
      cy.writeFile(pact.fileName, pact.generatePactFile())
    })
  })
}
