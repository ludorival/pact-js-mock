/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Schema for a Pact file
 */
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
  comments?: Comments
  description: string
  interactionMarkup?: InteractionMarkup
  key?: string
  pending?: boolean
  pluginConfiguration?: { [key: string]: any }
  providerStates?: ProviderState[] | string
  request?: Request<TRequest>
  response?: MessageContents<TResponse>[] | ResponseClass<TResponse>
  type: InteractionType
  contents?: TResponse
  generators?: InteractionGenerators
  matchingRules?: InteractionMatchingRules
  metadata?: { [key: string]: any }
  metaData?: { [key: string]: any }
}

export type Comments = {
  testname?: string
  text?: string[]
  [property: string]: any
}

export type InteractionGenerators = {
  body?: BodyGenerator
  metadata?: RecordGenerator
}

export type BodyGenerator = Record<string, any>

export type RecordGenerator = Record<string, any>

export type InteractionMarkup = {
  markup: string
  markupType: MarkupType
}

export type MarkupType = 'COMMON_MARK' | 'HTML'

export type InteractionMatchingRules = {
  body: { [key: string]: any }
}

export type ProviderState = {
  name: string
  params?: { [key: string]: any }
  [property: string]: any
}

export type Request<T = any> = {
  body?: Body<T>
  generators?: RequestGenerators
  headers?: { [key: string]: any }
  matchingRules?: RequestMatchingRules
  method?: Method
  path?: string
  query?: { [key: string]: any }
  contents?: any
  metadata?: { [key: string]: any }
  metaData?: { [key: string]: any }
}

export type Body<T = any> = {
  content: T
  contentType: string
  contentTypeHint?: ContentTypeHint
  encoded?: boolean | string
}

export type ContentTypeHint = 'BINARY' | 'TEXT'

export type RequestGenerators = {
  body?: BodyGenerator
  headers?: RecordGenerator
  path?: RecordGenerator
  query?: Generator
  metadata?: RecordGenerator
  [property: string]: any
}

export type Generator = {
  format?: string
  type: GeneratorType
  digits?: number
  max?: number
  min?: number
  size?: number
  regex?: string
  example?: string
  expression?: string
}

export type GeneratorType =
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
  | 'MockServerURL'
  | 'ProviderState'

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
  variants?: any[]
  rules?: any[]
  status?: string
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
  | 'arrayContains'
  | 'eachKey'
  | 'eachValue'
  | 'notEmpty'
  | 'semver'
  | 'statusCode'

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

export type MessageContents<T = any> = {
  contents: T
  generators?: ResponseGeneratorsClass
  matchingRules?: PurpleMatchingRules
  metadata?: { [key: string]: any }
  metaData?: { [key: string]: any }
}

export type ResponseGeneratorsClass = {
  body?: BodyGenerator
  metadata?: RecordGenerator
}

export type PurpleMatchingRules = {
  body: { [key: string]: any }
}

export type ResponseClass<T = any> = {
  body?: Body<T>
  generators?: ResponseGeneratorsObject
  headers?: { [key: string]: any }
  matchingRules?: FluffyMatchingRules
  status: number
}

export type ResponseGeneratorsObject = {
  body?: BodyGenerator
  headers?: RecordGenerator
  status?: Generator
  [property: string]: any
}

export type FluffyMatchingRules = {
  body?: { [key: string]: any }
  header?: { [key: string]: any }
  path?: Matchers
  query?: { [key: string]: any }
}

export type InteractionType =
  | 'Synchronous/HTTP'
  | 'Asynchronous/Messages'
  | 'Synchronous/Messages'

export type Metadata = {
  pactSpecification?: PactSpecification
  client?: {
    name: 'pact-js-mock'
    version: string
  }
  [property: string]: any
}

export type PactSpecification = {
  version: '4.0.0'
}
