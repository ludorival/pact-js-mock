import {
  InputPact,
  Options,
  PactFile,
  PactV2,
  ResolvedPactEnvironment,
} from '../types'
import { Pact } from './pact'

export class PactRegistry<T extends PactFile = PactV2.PactFile> {
  private readonly namedPacts = new Map<string, Pact<T>>()

  constructor(private readonly config: ResolvedPactEnvironment) {}

  register(name: string, pact: Pact<T>): void {
    this.namedPacts.set(name, pact)
  }

  get(name: string): Pact<T> | null {
    return this.namedPacts.get(name) ?? null
  }

  getOrCreate(providerName: string, options?: Options): Pact<T> {
    const existing = this.namedPacts.get(providerName)
    if (existing) {
      return existing
    }

    const pactDefinition = {
      consumer: { name: this.config.consumerName },
      provider: { name: providerName },
      metadata: {
        pactSpecification: { version: this.config.pactVersion },
      },
    } as InputPact<T>

    const pactOptions: Options | undefined = {
      ...this.config.options,
      ...options,
      ...(this.config.outputDir ? { outputDir: this.config.outputDir } : {}),
    }

    const pact = new Pact<T>(pactDefinition, pactOptions)
    this.namedPacts.set(providerName, pact)
    return pact
  }

  clear(): void {
    this.namedPacts.forEach((pact) => {
      pact.reset()
    })
    this.namedPacts.clear()
  }

  getAll(): Pact<T>[] {
    return Array.from(this.namedPacts.values())
  }
}
