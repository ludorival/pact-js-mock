import { Pact } from '../core'
import { PactFile } from '../types'

/**
 * Registry for managing Pact instances in Cypress tests
 */
class PactRegistry {
  private defaultPact: Pact<PactFile> | null = null
  private namedPacts: Map<string, Pact<PactFile>> = new Map()
  private testPacts: Map<string, Pact<PactFile>> = new Map()

  /**
   * Register a default Pact instance
   */
  registerDefault(pact: Pact<PactFile>): void {
    this.defaultPact = pact
  }

  /**
   * Register a named Pact instance
   */
  register(name: string, pact: Pact<PactFile>): void {
    this.namedPacts.set(name, pact)
  }

  /**
   * Get the default Pact instance
   */
  getDefault(): Pact<PactFile> | null {
    return this.defaultPact
  }

  /**
   * Get a named Pact instance
   */
  get(name: string): Pact<PactFile> | null {
    return this.namedPacts.get(name) || null
  }

  /**
   * Get or create a Pact instance for a specific test
   */
  getForTest(testTitle: string): Pact<PactFile> | null {
    if (this.testPacts.has(testTitle)) {
      return this.testPacts.get(testTitle) || null
    }
    return this.defaultPact
  }

  /**
   * Associate a Pact instance with a specific test
   */
  setForTest(testTitle: string, pact: Pact<PactFile>): void {
    this.testPacts.set(testTitle, pact)
  }

  /**
   * Clear all registered pacts (useful for cleanup)
   */
  clear(): void {
    this.defaultPact = null
    this.namedPacts.clear()
    this.testPacts.clear()
  }

  /**
   * Get all registered Pact instances
   */
  getAll(): Pact<PactFile>[] {
    const pacts: Pact<PactFile>[] = []
    if (this.defaultPact) {
      pacts.push(this.defaultPact)
    }
    this.namedPacts.forEach((pact) => pacts.push(pact))
    return pacts
  }
}

// Singleton instance
export const pactRegistry = new PactRegistry()
