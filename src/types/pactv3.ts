/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Schema for a Pact file
 */
export type PactFile = {
  consumer: Pacticipant
  interactions?: Interaction[]
  messages?: Message[]
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
  providerStates?: ProviderState[] | string
  request: Request<TRequest>
  response: Response<TResponse>
}

export type ProviderState = {
  name: string
  params?: { [key: string]: any }
  [property: string]: any
}

export type Request<T = any> = {
  body?: T
  generators?: RequestGenerators
  headers?: { [key: string]: any }
  matchingRules?: RequestMatchingRules
  method: Method
  path: string
  query?: { [key: string]: any }
}

export type RequestGenerators = {
  body?: BodyGenerator
  headers?: RecordGenerator
  path?: RecordGenerator
  query?: Generator
  [property: string]: any
}

export type BodyGenerator = Record<string, any>

export type RecordGenerator = Record<string, any>

export type Generator = {
  format?: string
  type: Type
  digits?: number
  max?: number
  min?: number
  size?: number
  regex?: string
}

export type Type =
  | 'Date'
  | 'DateTime'
  | 'RandomBoolean'
  | 'RandomDecimal'
  | 'RandomHexadecimal'
  | 'RandomInt'
  | 'RandomString'
  | 'Regex'
  | 'Time'
  | 'Uuid'

export type RequestMatchingRules = {
  body?: { [key: string]: any }
  header?: { [key: string]: any }
  path?: Matchers
  query?: { [key: string]: any }
}

export type Matchers = {
  combine?: Combine
  matchers: Match[]
}

export type Combine = 'AND' | 'OR'

export type Match = {
  match: MatchEnum
  regex?: string
  max?: number
  min?: number
  value?: string
  format?: string
}

export type MatchEnum =
  | 'regex'
  | 'type'
  | 'boolean'
  | 'contentType'
  | 'date'
  | 'datetime'
  | 'decimal'
  | 'equality'
  | 'include'
  | 'integer'
  | 'null'
  | 'number'
  | 'time'
  | 'values'

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
  generators?: ResponseGenerators
  headers?: { [key: string]: any }
  matchingRules?: RequestMatchingRules
  status: number
}

export type ResponseGenerators = {
  body?: BodyGenerator
  headers?: RecordGenerator
  status?: Generator
  [property: string]: any
}

export type Message = {
  contents: any
  description: string
  generators?: GeneratorsClass
  matchingRules?: MessageMatchingRules
  metadata?: { [key: string]: any }
  metaData?: { [key: string]: any }
  providerState?: string
}

export type GeneratorsClass = {
  body?: BodyGenerator
  metadata?: RecordGenerator
}

export type MessageMatchingRules = {
  body: { [key: string]: any }
}

export type Metadata = {
  'pact-specification'?: PactSpecification
  pactSpecification?: PactSpecification
  pactSpecificationVersion?: '3.0.0'
  client?: {
    name: 'pact-js-mock'
    version: string
  }
  [property: string]: any
}

export type PactSpecification = {
  version: '3.0.0'
}
