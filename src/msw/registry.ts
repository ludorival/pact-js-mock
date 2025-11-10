import { readPactConfigFile } from '../core/config'
import { PactRegistry } from '../core/registry'
import { PactFile, ResolvedPactEnvironment } from '../types'

function resolvePactEnvironment(): ResolvedPactEnvironment {
  const fileConfig = readPactConfigFile()

  return {
    consumerName: fileConfig.consumerName ?? 'my-consumer',
    pactVersion: fileConfig.pactVersion ?? '2.0.0',
    outputDir: fileConfig.outputDir,
    options: fileConfig.options,
  }
}

export const pactRegistry = new PactRegistry<PactFile>(resolvePactEnvironment())
