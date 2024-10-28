/* eslint-disable @typescript-eslint/no-explicit-any */

export type PactFile = {
  consumer: Pacticipant
  interactions: Interaction[]
  metadata: Metadata
  provider: Pacticipant
  [property: string]: any
}

export type Pacticipant = {
  name: string
  [property: string]: any
}

export type Interaction<TResponse = any, TRequest = any> = {
  description: string
  providerState?: string
  request: Request<TRequest>
  response: Response<TResponse>
}

export type Request<T = any> = {
  body?: T
  headers?: { [key: string]: any }
  matchingRules?: MatchingRules
  method: Method
  path: string
  query?: string
}

export type MatchingRules = Record<string, any>

export type Method =
  | 'connect'
  | 'CONNECT'
  | 'delete'
  | 'DELETE'
  | 'get'
  | 'GET'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'trace'
  | 'TRACE'

export type Response<T = any> = {
  body?: T
  headers?: { [key: string]: any }
  matchingRules?: MatchingRules
  status: number
}

export type Metadata = {
  'pact-specification'?: PactSpecification
  pactSpecification?: PactSpecification
  pactSpecificationVersion?: '2.0.0'
  client?: {
    name: 'pact-js-mock'
    version: string
  }
  [property: string]: any
}

export type PactSpecification = {
  version: '2.0.0'
}
