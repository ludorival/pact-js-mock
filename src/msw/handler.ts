import { omit } from 'lodash'
import {
  DefaultBodyType,
  HttpResponse,
  HttpResponseInit,
  HttpResponseResolver,
  RequestHandlerOptions,
  StrictRequest,
  StrictResponse,
  GraphQLResponseResolver,
  GraphQLQuery,
  GraphQLVariables,
} from 'msw'
import { Pact, buildResponse } from '../core'
import {
  InteractionFor,
  MinimalInteraction,
  PactFile,
  PactInteractionOptions,
  PactV2,
  PactV3,
  PactV4,
  Request,
  ToRecordInteraction,
} from '../types'

import type { PathParams } from 'msw/lib/core/utils/matching/matchRequestUrl.js'
import { inferProviderName } from '../core'

import { pactRegistry } from './registry'

// Extended options that merge MSW's RequestHandlerOptions with PactInteractionOptions
export type PactRequestHandlerOptions = RequestHandlerOptions &
  PactInteractionOptions

// Helper to separate Pact options from MSW options
export function separatePactOptions(options?: PactRequestHandlerOptions): {
  pactOptions: PactInteractionOptions | undefined
  mswOptions: RequestHandlerOptions | undefined
} {
  if (!options) {
    return { pactOptions: undefined, mswOptions: undefined }
  }

  const {
    description,
    providerState,
    providerStates,
    matchingRules,
    generators,
    metadata,
    ...mswOptions
  } = options

  const pactOptions: PactInteractionOptions | undefined =
    description ||
    providerState ||
    providerStates ||
    matchingRules ||
    generators ||
    metadata
      ? {
          ...(description && { description }),
          ...(providerState && { providerState }),
          ...(providerStates && { providerStates }),
          ...(matchingRules && { matchingRules }),
          ...(generators && { generators }),
          ...(metadata && { metadata }),
        }
      : undefined

  return {
    pactOptions,
    mswOptions: Object.keys(mswOptions).length > 0 ? mswOptions : undefined,
  }
}

// Helper to merge PactInteractionOptions into an interaction
function mergePactOptions<
  P extends PactFile,
  TResponse extends DefaultBodyType,
>(
  interaction: MinimalInteraction<InteractionFor<P, TResponse>>,
  pactOptions?: PactInteractionOptions,
): MinimalInteraction<InteractionFor<P, TResponse>> {
  if (!pactOptions) {
    return interaction
  }

  return {
    ...interaction,
    ...(pactOptions.description && { description: pactOptions.description }),
    ...(pactOptions.providerState && {
      providerState: pactOptions.providerState,
    }),
    ...(pactOptions.providerStates && {
      providerStates: pactOptions.providerStates,
    }),
    ...(pactOptions.matchingRules && {
      matchingRules: pactOptions.matchingRules,
    }),
    ...(pactOptions.generators && { generators: pactOptions.generators }),
    ...(pactOptions.metadata && { metadata: pactOptions.metadata }),
  } as MinimalInteraction<InteractionFor<P, TResponse>>
}

// Helper to record Pact interaction asynchronously (non-blocking)
async function recordPactInteraction(
  response: Response,
  info: Info,
  providerName: string,
  pactOptions?: PactInteractionOptions,
): Promise<void> {
  try {
    // Clone the response to avoid consuming the original body stream
    const clonedResponse = response.clone()

    // Extract response data asynchronously
    let responseData: unknown
    try {
      responseData = await clonedResponse.json()
    } catch {
      // If JSON parsing fails, try text or get body
      try {
        responseData = await clonedResponse.text()
      } catch {
        // If we can't extract the response, skip recording
        return
      }
    }

    const status = response.status
    const headersObj = response.headers
    const headers =
      headersObj instanceof Headers
        ? Object.fromEntries(headersObj.entries())
        : (headersObj as Record<string, string>)

    const pact = pactRegistry.getOrCreate(providerName)

    // Build interaction for recording
    const version = pact.version
    const interaction = buildResponse(
      responseData,
      version,
    ) as MinimalInteraction<InteractionFor<PactFile, DefaultBodyType>>

    // Set status and headers
    if (version === '4.0.0') {
      const responseV4 = interaction.response as {
        status?: number
        headers?: Record<string, string>
      }
      responseV4.status = status
      responseV4.headers = headers
    } else {
      const responseV2V3 = interaction.response as {
        status?: number
        headers?: Record<string, string>
      }
      responseV2V3.status = status
      responseV2V3.headers = headers
    }

    // Merge pact options
    const finalInteraction = mergePactOptions(interaction, pactOptions)

    // Record the interaction
    await toResponse(pact, finalInteraction, info)
  } catch {
    // If we can't record, fail silently to not break the response
    // This can happen with custom response types or parsing errors
  }
}

// Helper to wrap a resolver to record pacts
export function wrapResolverWithPact<
  Params extends PathParams<keyof Params>,
  RequestBodyType extends DefaultBodyType,
  ResponseBodyType extends DefaultBodyType,
>(
  resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>,
  pactOptions?: PactInteractionOptions,
): HttpResponseResolver<Params, RequestBodyType, ResponseBodyType> {
  return async (info) => {
    const providerName =
      inferProviderName(info.request.url) || 'unknown-provider'

    // Call the original resolver
    const response = await resolver(info)

    // Extract response data for recording (only if it's an HttpResponse)
    if (
      response &&
      typeof response === 'object' &&
      'status' in response &&
      'headers' in response &&
      'json' in response
    ) {
      // Record Pact interaction asynchronously without blocking
      // Fire and forget - don't await to avoid blocking the response
      await recordPactInteraction(
        response as Response,
        info as unknown as Info,
        providerName,
        pactOptions,
      ).catch(() => {
        // Silently handle any errors in recording to not break the response
      })
    }

    // Return the response immediately without waiting for recording
    return response
  }
}

// Helper to wrap a GraphQL resolver to record pacts
export function wrapGraphQLResolverWithPact<
  Query extends GraphQLQuery = GraphQLQuery,
  Variables extends GraphQLVariables = GraphQLVariables,
>(
  resolver: GraphQLResponseResolver<Query, Variables>,
  pactOptions?: PactInteractionOptions,
): GraphQLResponseResolver<Query, Variables> {
  return async (info) => {
    const providerName =
      inferProviderName(info.request.url) || 'unknown-provider'

    // Call the original resolver
    const response = await resolver(info)

    // Extract response data for recording (only if it's an HttpResponse)
    if (
      response &&
      typeof response === 'object' &&
      'status' in response &&
      'headers' in response &&
      'json' in response
    ) {
      // Record Pact interaction asynchronously without blocking
      // Fire and forget - don't await to avoid blocking the response
      await recordPactInteraction(
        response as Response,
        info as unknown as Info,
        providerName,
        pactOptions,
      ).catch(() => {
        // Silently handle any errors in recording to not break the response
      })
    }

    // Return the response immediately without waiting for recording
    return response
  }
}
export type Info<
  R extends DefaultBodyType = DefaultBodyType,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> = {
  request: StrictRequest<R>
} & Extra

export function toResolver<
  P extends PactFile,
  T extends object,
  R extends DefaultBodyType = DefaultBodyType,
>(
  pact: Pact<P>,
  input: MinimalInteraction<InteractionFor<P, T>> | T,
): (info: Info<R>) => Promise<StrictResponse<T>> {
  const version = pact.version
  return async (info) => {
    const interaction =
      'response' in input ? input : buildResponse(input, version)
    const response = await toResponse(
      pact,
      interaction as MinimalInteraction<InteractionFor<P, T>>,
      info,
    )
    return response
  }
}

export async function toResponse<
  P extends PactFile,
  TResponse extends DefaultBodyType,
  TRequest extends DefaultBodyType = DefaultBodyType,
>(
  pact: Pact<P>,
  interaction: MinimalInteraction<InteractionFor<P, TResponse>>,
  info: Info<TRequest>,
  initOptions?: HttpResponseInit,
): Promise<StrictResponse<TResponse>> {
  if (!info.request)
    throw new Error(
      'Expected "info" to have a "request" attribute. This issue may be caused by an incorrect MSW version. Ensure you are using MSW version 2 or higher and that it’s correctly imported.',
    )
  const toRecord = {
    ...interaction,
    request: await toRequest(info),
  } as ToRecordInteraction<InteractionFor<P>>
  pact.record(toRecord)

  const responseV4 = (interaction.response as { body?: { content: unknown } })
    .body?.content
    ? (interaction.response as PactV4.ResponseClass)
    : null
  const response = responseV4
    ? null
    : (interaction.response as PactV2.Response | PactV3.Response)
  const content = responseV4?.body?.content || response?.body

  const responseStatus = responseV4?.status || response?.status || 200

  return HttpResponse.json(content, {
    headers: response?.headers || responseV4?.headers,
    status: responseStatus,
    ...initOptions,
  })
}

async function toRequest<R extends DefaultBodyType = DefaultBodyType>(
  info: Info<R>,
): Promise<Request> {
  const url = new URL(info.request.url)
  const path = url.pathname
  const query = url.searchParams.toString() || undefined
  const body = info.query
    ? omit(info, 'request', 'requestId')
    : await info.request.json().catch(() => info.request.body)
  const headers: Record<string, unknown> = {}
  info.request.headers.forEach((value, key) => (headers[key] = value))
  return {
    method: info.request.method,
    path,
    headers,
    body,
    query,
  } as Request
}
