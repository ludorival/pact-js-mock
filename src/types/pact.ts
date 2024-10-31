import * as PactV2 from './pactv2'
import * as PactV3 from './pactv3'
import * as PactV4 from './pactv4'

export type HeaderType = Record<string, string | string[]> | undefined

export type PactFile = PactV2.PactFile | PactV3.PactFile | PactV4.PactFile

export type Interaction<TResponse = unknown> =
  | PactV2.Interaction<TResponse>
  | PactV3.Interaction<TResponse>
  | PactV4.Interaction<TResponse>

export type MinimalInteraction<I extends Interaction = PactV2.Interaction> =
  Partial<I> & Pick<I, 'response'>

export type ToRecordInteraction<I extends Interaction> = Partial<Partial<I>> &
  Pick<I, 'response' | 'request'>

export type Version =
  | PactV2.PactSpecification['version']
  | PactV3.PactSpecification['version']
  | PactV4.PactSpecification['version']

export type InteractionFor<
  P extends PactFile,
  TResponse = unknown,
  TRequest = unknown,
> = P extends PactV2.PactFile
  ? PactV2.Interaction<TResponse, TRequest>
  : P extends PactV3.PactFile
    ? PactV3.Interaction<TResponse, TRequest>
    : P extends PactV4.PactFile
      ? PactV4.Interaction<TResponse, TRequest>
      : never

export type InputPact<P extends PactFile> = Partial<P> &
  Pick<P, 'consumer' | 'provider' | 'metadata'>

export { PactV2, PactV3, PactV4 }

export type Request = PactV2.Request | PactV3.Request | PactV4.Request

export type Options = {
  headersConfig?: HeadersConfig
  basePath?: string
  deterministic?: boolean
}

export type HeadersConfig = {
  includes?: string[]
  excludes?: string[]
}
