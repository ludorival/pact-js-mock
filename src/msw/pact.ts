import { Pact as BasePact } from '../core'
import { InputPact, Options, PactFile } from '../types'

export class Pact<P extends PactFile> extends BasePact<P> {
  constructor(pact: InputPact<P>, options?: Options) {
    super(pact, options)
  }
}
