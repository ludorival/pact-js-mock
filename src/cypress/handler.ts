import type {
  CyHttpMessages,
  RouteHandlerController,
  StaticResponse,
} from 'cypress/types/net-stubbing'
import { Pact as BasePact, buildResponse } from '../core'
import type {
  InteractionFor,
  MinimalInteraction,
  PactFile,
  PactV2,
  PactV3,
  PactV4,
  ToRecordInteraction,
  PactInteractionOptions,
} from '../types'

type Request = PactV2.Request | PactV3.Request | PactV4.Request

function toRequest(req: CyHttpMessages.IncomingHttpRequest): Request {
  const url = new URL(req.url)
  const path = url.pathname
  const query = url.search
  const body: Body = req.body

  return {
    method: req.method,
    path,
    headers: req.headers,
    body,
    query,
  } as Request
}

function buildInteractionFromResponse<P extends PactFile>(
  pactInstance: BasePact<P>,
  response: StaticResponse | string | object,
  pactOptions?: PactInteractionOptions,
): MinimalInteraction<InteractionFor<P>> {
  const version = pactInstance.version

  // Handle StaticResponse vs plain object/string
  let responseData: PactV2.Response | PactV3.Response | PactV4.ResponseClass
  const isStaticResponse =
    typeof response === 'object' && 'statusCode' in response

  if (isStaticResponse) {
    const staticResponse = response as StaticResponse
    // Check if body property exists (even if undefined)
    const hasBodyProperty = 'body' in staticResponse

    if (hasBodyProperty) {
      // StaticResponse has a body property (may be undefined)
      const baseInteraction = buildResponse(
        staticResponse.body as unknown,
        version,
      )
      responseData = baseInteraction.response as
        | PactV2.Response
        | PactV3.Response
        | PactV4.ResponseClass
    } else {
      // StaticResponse has no body property - create response without body
      if (version === '4.0.0') {
        responseData = {
          status: staticResponse.statusCode || 200,
        } as PactV4.ResponseClass
        if (staticResponse.headers) {
          responseData.headers = staticResponse.headers
        }
      } else {
        responseData = {
          status: staticResponse.statusCode || 200,
        } as PactV2.Response | PactV3.Response
        if (staticResponse.headers) {
          responseData.headers = staticResponse.headers
        }
      }
    }

    // Override status and headers if provided (in case buildResponse set defaults)
    if (staticResponse.statusCode) {
      if (version === '4.0.0') {
        ;(responseData as PactV4.ResponseClass).status =
          staticResponse.statusCode
      } else {
        ;(responseData as PactV2.Response | PactV3.Response).status =
          staticResponse.statusCode
      }
    }
    if (staticResponse.headers) {
      if (version === '4.0.0') {
        ;(responseData as PactV4.ResponseClass).headers = staticResponse.headers
      } else {
        ;(responseData as PactV2.Response | PactV3.Response).headers =
          staticResponse.headers
      }
    }
  } else {
    // Plain object or string - use buildResponse directly
    const baseInteraction = buildResponse(response, version)
    responseData = baseInteraction.response as
      | PactV2.Response
      | PactV3.Response
      | PactV4.ResponseClass
  }

  // Build interaction with correct property order:
  // description (handled by Pact.record), providerState/providerStates, response, then other properties
  // Use type assertion since we're building a valid interaction dynamically
  const interaction = {
    // Description is handled by Pact.record(), but we include it if provided for completeness
    ...(pactOptions?.description && { description: pactOptions.description }),
    // Provider state(s) should come before response
    ...(pactOptions?.providerState && {
      providerState: pactOptions.providerState,
    }),
    ...(pactOptions?.providerStates && {
      providerStates: pactOptions.providerStates,
    }),
    // Response comes after provider state
    response: responseData,
    // Other properties come after response
    ...(pactOptions?.matchingRules && {
      matchingRules: pactOptions.matchingRules,
    }),
    ...(pactOptions?.generators && { generators: pactOptions.generators }),
    ...(pactOptions?.metadata && { metadata: pactOptions.metadata }),
  } as MinimalInteraction<InteractionFor<P>>

  return interaction
}

function recordResponse<P extends PactFile>(
  pactInstance: BasePact<P>,
  interaction: MinimalInteraction<InteractionFor<P>>,
  req: CyHttpMessages.IncomingHttpRequest,
): StaticResponse {
  const request = toRequest(req)
  pactInstance.record({ ...interaction, request } as ToRecordInteraction<
    InteractionFor<P>
  >)
  const responseV4 = (interaction.response as { body?: { content: unknown } })
    .body?.content
    ? (interaction.response as PactV4.ResponseClass)
    : null
  const response = responseV4
    ? null
    : (interaction.response as PactV2.Response | PactV3.Response)

  return {
    statusCode: responseV4?.status || response?.status,
    body: responseV4?.body || response?.body,
    headers: responseV4?.headers || response?.headers,
  }
}

export function toHandler<P extends PactFile>(
  pactInstance: BasePact<P>,
  response: StaticResponse | string | object,
  pactOptions?: PactInteractionOptions,
): RouteHandlerController {
  return (req) => {
    const interaction = buildInteractionFromResponse(
      pactInstance,
      response,
      pactOptions,
    )
    req.reply(recordResponse(pactInstance, interaction, req))
  }
}
