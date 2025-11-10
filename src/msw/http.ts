import type {
  DefaultBodyType,
  HttpRequestHandler,
  HttpResponseResolver,
} from 'msw'
import { http as mswHttp } from 'msw'
import type { PathParams } from 'msw/lib/core/utils/matching/matchRequestUrl.js'
import {
  wrapResolverWithPact,
  PactRequestHandlerOptions,
  separatePactOptions,
} from './handler'
// Create wrapper for http methods - matches MSW signature exactly but with merged options
function createHttpWrapper() {
  // Helper to create a wrapped http method
  function createWrappedMethod(
    method: HttpRequestHandler,
  ): <
    Params extends PathParams<keyof Params> = PathParams,
    RequestBodyType extends DefaultBodyType = DefaultBodyType,
    ResponseBodyType extends DefaultBodyType = DefaultBodyType,
  >(
    predicate: string | RegExp,
    resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>,
    options?: PactRequestHandlerOptions,
  ) => ReturnType<HttpRequestHandler> {
    return <
      Params extends PathParams<keyof Params> = PathParams,
      RequestBodyType extends DefaultBodyType = DefaultBodyType,
      ResponseBodyType extends DefaultBodyType = DefaultBodyType,
    >(
      predicate: string | RegExp,
      resolver: HttpResponseResolver<Params, RequestBodyType, ResponseBodyType>,
      options?: PactRequestHandlerOptions,
    ) => {
      // Extract pact options and MSW options
      const { pactOptions, mswOptions } = separatePactOptions(options)

      // Wrap the resolver to record pacts
      const wrappedResolver = wrapResolverWithPact(resolver, pactOptions)
      // Call the original MSW method with wrapped resolver and MSW options
      return method(predicate, wrappedResolver, mswOptions)
    }
  }

  return {
    get: createWrappedMethod(mswHttp.get),
    post: createWrappedMethod(mswHttp.post),
    put: createWrappedMethod(mswHttp.put),
    patch: createWrappedMethod(mswHttp.patch),
    delete: createWrappedMethod(mswHttp.delete),
    head: createWrappedMethod(mswHttp.head),
    options: createWrappedMethod(mswHttp.options),
    all: mswHttp.all,
  }
}

export const pactHttp = createHttpWrapper()
