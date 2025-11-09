import { PactRegistry } from '../core'
import { PactFile } from '../types'
import { createConfiguredPact, Pact } from './pact'

export const pactRegistry = new PactRegistry<Pact<PactFile>>(
  createConfiguredPact,
)
