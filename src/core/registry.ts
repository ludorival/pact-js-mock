export class PactRegistry<T> {
  private readonly namedPacts = new Map<string, T>()

  constructor(private readonly factory: (name: string) => T) {}

  register(name: string, pact: T): void {
    this.namedPacts.set(name, pact)
  }

  get(name: string): T | null {
    return this.namedPacts.get(name) ?? null
  }

  getOrCreate(name: string): T {
    const existing = this.namedPacts.get(name)
    if (existing) {
      return existing
    }

    if (!this.factory) {
      throw new Error(
        `No factory provided for PactRegistry. Unable to create pact for ${name}`,
      )
    }

    const pact = this.factory(name)
    this.namedPacts.set(name, pact)
    return pact
  }

  clear(): void {
    this.namedPacts.clear()
  }

  getAll(): T[] {
    return Array.from(this.namedPacts.values())
  }
}
