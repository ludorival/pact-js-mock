import { PactFile } from '../types'
import packageJson from '../../package.json'

export function omitVersion<P extends PactFile>(pactFile: P, check = true): P {
  const client = pactFile.metadata.client
  if (check && client?.name !== 'pact-js-mock') {
    throw new Error(
      `Expect the generated pact file use the right client name ${packageJson.name} but got ${client?.name}`,
    )
  }
  if (check && client?.version !== packageJson.version) {
    throw new Error(
      `Expect the generated pact file use the current version of ${packageJson.name} (${packageJson.version}) but got ${client?.version}`,
    )
  }
  return {
    ...pactFile,
    metadata: { ...pactFile.metadata, client: { name: client?.name } },
  }
}
