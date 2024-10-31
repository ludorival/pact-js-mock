import { omit } from 'lodash'
import type {
  DefaultBodyType,
  HttpResponse,
  HttpResponseInit,
  StrictRequest,
  StrictResponse,
} from 'msw'
import { Pact as BasePact, buildResponse } from '../core'
import {
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
} from '../types'
type Info<
  R extends DefaultBodyType = DefaultBodyType,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> = {
  request: StrictRequest<R>
} & Extra
export class Pact<P extends PactFile> extends BasePact<P> {
  constructor(pact: InputPact<P>, options?: Options) {
    super(pact, options)
  }

  toResolver<T extends object, R extends DefaultBodyType = DefaultBodyType>(
    input: MinimalInteraction<InteractionFor<P, T>> | T,
  ): (info: Info<R>) => Promise<StrictResponse<T>> {
    const version = this.version
    return async (info) => {
      const interaction =
        'response' in input ? input : buildResponse(input, version)
      const response = await this.toResponse(
        interaction as MinimalInteraction<InteractionFor<P, T>>,
        info,
      )
      return response
    }
  }

  async toResponse<
    TResponse extends DefaultBodyType,
    TRequest extends DefaultBodyType = DefaultBodyType,
  >(
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
    this.record(toRecord)

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
