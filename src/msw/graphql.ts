import type {
  GraphQLRequestHandler,
  GraphQLResponseResolver,
  GraphQLQuery,
  GraphQLVariables,
  GraphQLHandler,
} from 'msw'
import { graphql as mswGraphql } from 'msw'
import {
  wrapGraphQLResolverWithPact,
  PactRequestHandlerOptions,
  separatePactOptions,
} from './handler'

// Create wrapper for GraphQL methods - matches MSW signature exactly but with merged options
function createGraphQLWrapper() {
  // Helper to create a wrapped GraphQL request handler (for query and mutation)
  function createWrappedRequestHandler(
    method: GraphQLRequestHandler,
  ): GraphQLRequestHandler {
    return <
      Query extends GraphQLQuery = GraphQLQuery,
      Variables extends GraphQLVariables = GraphQLVariables,
    >(
      predicate: Parameters<GraphQLRequestHandler>[0],
      resolver: GraphQLResponseResolver<
        [Query] extends [never] ? GraphQLQuery : Query,
        Variables
      >,
      options?: PactRequestHandlerOptions,
    ) => {
      // Extract pact options and MSW options
      const { pactOptions, mswOptions } = separatePactOptions(options)

      // Wrap the resolver to record pacts
      const wrappedResolver = wrapGraphQLResolverWithPact<
        [Query] extends [never] ? GraphQLQuery : Query,
        Variables
      >(resolver, pactOptions)
      // Call the original MSW method with wrapped resolver and MSW options
      return method(predicate, wrappedResolver, mswOptions)
    }
  }

  // Helper to create a wrapped operation handler
  function createWrappedOperationHandler(): <
    Query extends GraphQLQuery = GraphQLQuery,
    Variables extends GraphQLVariables = GraphQLVariables,
  >(
    resolver: GraphQLResponseResolver<Query, Variables>,
    options?: PactRequestHandlerOptions,
  ) => GraphQLHandler {
    return <
      Query extends GraphQLQuery = GraphQLQuery,
      Variables extends GraphQLVariables = GraphQLVariables,
    >(
      resolver: GraphQLResponseResolver<Query, Variables>,
      options?: PactRequestHandlerOptions,
    ) => {
      // Extract pact options and MSW options
      const { pactOptions } = separatePactOptions(options)

      // Wrap the resolver to record pacts
      const wrappedResolver = wrapGraphQLResolverWithPact(resolver, pactOptions)
      // Call the original MSW method with wrapped resolver and MSW options
      return mswGraphql.operation(wrappedResolver)
    }
  }

  return {
    query: createWrappedRequestHandler(mswGraphql.query),
    mutation: createWrappedRequestHandler(mswGraphql.mutation),
    operation: createWrappedOperationHandler(),
    link: mswGraphql.link,
  }
}

export const pactGraphql = createGraphQLWrapper()
