import type {
  CyHttpMessages,
  RouteHandlerController,
  StaticResponse,
} from 'cypress/types/net-stubbing'
import { Pact as BasePact, buildResponse } from '../core'
import {
  InputPact,
  InteractionFor,
  MinimalInteraction,
  PactFile,
  PactV2,
  PactV3,
  PactV4,
  ToRecordInteraction,
} from '../types'
import { HeadersConfig } from './types'

type Options = {
  headersConfig?: HeadersConfig
  basePath?: string
}

type Request = PactV2.Request | PactV3.Request | PactV4.Request
export class Pact<P extends PactFile> extends BasePact<P> {
  constructor(pact: InputPact<P>, options?: Options) {
    super(pact, options)
  }

  toHandler<T extends object>(
    input: MinimalInteraction<InteractionFor<P, T>> | T
  ): RouteHandlerController {
    const version = this.version
    return (req) => {
      const interaction =
        'response' in input ? input : buildResponse(input, version)
      req.reply(
        this.recordResponse(
          interaction as MinimalInteraction<InteractionFor<P, T>>,
          req
        )
      )
    }
  }
  recordResponse(
    interaction: MinimalInteraction<InteractionFor<P>>,
    req: CyHttpMessages.IncomingHttpRequest
  ): StaticResponse {
    const request = toRequest(req)
    this.record({ ...interaction, request } as ToRecordInteraction<
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
}

function toRequest(req: CyHttpMessages.IncomingHttpRequest): Request {
  const parts = req.url.split('?')
  const path = parts[0]
  const query = parts.slice(1).join('?')
  const body: Body = req.body

  return {
    method: req.method,
    path,
    headers: req.headers,
    body,
    query,
  } as Request
}
