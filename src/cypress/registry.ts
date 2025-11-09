import { createConfiguredPact, Pact } from './pact'
import { PactFile } from '../types'

/**
 * Registry for managing Pact instances in Cypress tests
 */
class PactRegistry {
  private namedPacts: Map<string, Pact<PactFile>> = new Map()

  /**
   * Get a named Pact instance
   */
  get(name: string): Pact<PactFile> | null {
    return this.namedPacts.get(name) || null
  }

  getOrCreate(name: string): Pact<PactFile> {
    if (this.namedPacts.has(name)) {
      return this.namedPacts.get(name) as Pact<PactFile>
    }
    const pact = createConfiguredPact(name)
    this.namedPacts.set(name, pact)
    return pact
  }

  /**
   * Clear all registered pacts (useful for cleanup)
   */
  clear(): void {
    this.namedPacts.clear()
  }

  /**
   * Get all registered Pact instances
   */
  getAll(): Pact<PactFile>[] {
    const pacts: Pact<PactFile>[] = []
    this.namedPacts.forEach((pact) => pacts.push(pact))
    return pacts
  }
}

// Singleton instance
export const pactRegistry = new PactRegistry()
