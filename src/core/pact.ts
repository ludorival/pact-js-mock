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
  constructor(
    private pact: InputPact<T>,
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
    const existingInteractionIndex = this.interactions.findIndex(
      (i) => i.description === description,
    )
    const existingInteraction = this.interactions[existingInteractionIndex]
    const sameInteraction =
      existingInteraction &&
      JSON.stringify(existingInteraction) == JSON.stringify(interaction)

    if (
      this.options?.deterministic &&
      existingInteraction &&
      !sameInteraction
    ) {
      throw new Error(
        `The interaction \`${description}\` already exists but with different content. It is recommended that the interaction stays deterministic.`,
      )
    }
    if (!existingInteraction) {
      this.interactions.push(interaction)
    } else {
      this.interactions[existingInteractionIndex] = interaction
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
