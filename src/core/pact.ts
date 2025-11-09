import { omit } from 'lodash'
import {
  HeaderType,
  HeadersConfig,
  InputPact,
  InteractionFor,
  MinimalInteraction,
  Options,
  PactFile,
  PactV2,
  PactV3,
  PactV4,
  Request,
  ToRecordInteraction,
  Version,
} from '../types'
import packageJson from '../../package.json'

function pactName<P extends PactFile>(pact: InputPact<P>) {
  return `${pact.consumer.name}-${pact.provider.name}`
}
export class Pact<T extends PactFile = PactV2.PactFile> {
  private interactions: InteractionFor<T>[] = []
  private currentSource: string | undefined
  constructor(
    protected pact: InputPact<T>,
    private options?: Options,
  ) {
    if (!pact.metadata?.pactSpecification?.version)
      throw new Error(`The version is missing in the Pact. Please provide the right version like
    { consumer: { name : 'my-consumer'}, provider : { name: 'my-provider'},
    metadata : {pactSpecification: { version : '2.0.0'}}}`)
  }

  public get name(): string {
    return pactName(this.pact)
  }
  public get version(): Version {
    return this.pact.metadata?.pactSpecification?.version || '2.0.0'
  }

  public get providerName(): string {
    return this.pact.provider?.name ?? ''
  }

  public setCurrentSource(source: string | undefined) {
    this.currentSource = source
  }

  protected setProviderName(name: string) {
    this.pact = {
      ...this.pact,
      provider: { ...(this.pact.provider || {}), name },
    }
  }

  public get fileName(): string {
    return `${this.options?.outputDir || 'pacts'}/${this.name}.json`
  }

  record<TResponse = unknown, TRequest = unknown>(
    input: ToRecordInteraction<InteractionFor<T, TResponse, TRequest>>,
  ) {
    const request = input.request as Request
    const response = input.response as { status?: number }
    const description =
      input.description ||
      `${input.request?.method} ${input.request?.path} returns status ${
        response.status || 200
      }`

    const interaction = {
      description,
      ...input,
      request: { ...this.toRequest(request) },
    } as InteractionFor<T, TResponse, TRequest>

    const sameDescriptions = this.interactions.filter((i) =>
      i.description.startsWith(description),
    )

    const perfectMatch = sameDescriptions.find((i) =>
      isSameInteraction(i, interaction),
    )

    if (perfectMatch) {
      return
    } else if (sameDescriptions.length > 0) {
      if (!this.options?.ignoreConflict)
        console.warn(
          `The interaction '${description}' already exists but with different content compared to the original one: ${diffInteractions(sameDescriptions[0], interaction)}`,
        )
      const currentSource = this.currentSource
      const newDescription = `${description}${currentSource ? ` (${currentSource})` : ''}`
      const count = sameDescriptions.filter(
        (i) => i.description == newDescription,
      ).length
      this.interactions.push({
        ...interaction,
        description: `${newDescription}${count ? ` - ${count}` : ''}`,
      })
    } else {
      this.interactions.push(interaction)
    }
  }

  private toRequest(req: Request): Request {
    const { headersConfig, basePath } = this.options || {}
    const path = req.path?.replace(basePath || '', '')
    if (req.headers) {
      req.headers = omitHeaders(req.headers, headersConfig)
    }
    return {
      ...req,
      path,
    } as Request
  }

  generatePactFile(): T {
    const pactFile = {
      ...(this.pact as T),
      interactions: this.interactions,
      metadata: {
        ...this.pact.metadata,
        client: { name: packageJson.name, version: packageJson.version },
      },
    }
    return pactFile
  }

  async reset(pactFile: T | null = null) {
    this.interactions = (pactFile?.interactions || []) as InteractionFor<T>[]
  }
}

const omitHeaders = (
  headers: HeaderType,
  headersConfig: HeadersConfig = {},
) => {
  const blocklist = headersConfig.excludes || []
  if (headersConfig.includes) {
    const remove = Object.keys(omit(headers, ...headersConfig.includes))
    blocklist.push(...remove)
  }
  return omit(headers, [...blocklist])
}

function isSameInteraction<P extends PactFile>(
  interaction1: InteractionFor<P>,
  interaction2: InteractionFor<P>,
) {
  return (
    JSON.stringify(omit(interaction1, 'description')) ===
    JSON.stringify(omit(interaction2, 'description'))
  )
}

function diffInteractions<P extends PactFile>(
  interaction1: InteractionFor<P>,
  interaction2: InteractionFor<P>,
) {
  const changes: string[] = []
  const keys = new Set([
    ...Object.keys(interaction1),
    ...Object.keys(interaction2),
  ] as (keyof typeof interaction1)[])

  for (const key of keys) {
    const value1 = JSON.stringify(interaction1[key])
    const value2 = JSON.stringify(interaction2[key])
    if (value1 !== value2) {
      changes.push(
        `${String(key)}:\n  Expected: ${value1}\n  Actual:   ${value2}`,
      )
    }
  }

  return changes.join('\n')
}

export function buildResponse<T>(content: T, version: Version) {
  switch (version) {
    case '2.0.0':
      return {
        response: { status: 200, body: content },
      } as MinimalInteraction<PactV2.Interaction>
    case '3.0.0':
      return {
        response: { status: 200, body: content },
      } as MinimalInteraction<PactV3.Interaction>

    case '4.0.0':
      return {
        response: {
          status: 200,
          body: { content, contentType: 'application/json' },
        },
      } as MinimalInteraction<PactV4.Interaction>
  }
}
