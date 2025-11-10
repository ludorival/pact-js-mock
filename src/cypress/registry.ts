import { PactRegistry } from '../core'
import { PactFile } from '../types'
import { resolvePactEnvironment } from './runtime-config'

export const pactRegistry = new PactRegistry<PactFile>(resolvePactEnvironment())
