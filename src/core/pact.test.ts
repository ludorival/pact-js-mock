import { omitVersion } from '../test/utils'
import { PactV2, PactV3, PactV4 } from '../types'
import { Pact } from './pact'
describe('PactV2', () => {
  const pact = new Pact<PactV2.PactFile>(
    {
      consumer: { name: 'consumer' },
      provider: { name: 'provider' },
      metadata: { pactSpecification: { version: '2.0.0' } },
    },
    {
      headersConfig: {
        includes: ['content-type'],
        excludes: ['Authorization'],
      },
      basePath: 'base',
    }
  )

  afterEach(() => {
    pact.reset()
  })

  it('should record a Pact V2 Interactions ', () => {
    // given

    const anInteraction = {
      description: 'This is a description',
      request: { method: 'POST', path: 'v1/todo', body: { name: 'Todo' } },
      response: {
        status: 200,
        body: 'This is an interaction with a description',
      },
    } as PactV2.Interaction

    // when
    pact.record({
      request: { method: 'GET', path: 'v1/todo' },
      response: {
        status: 200,
        body: 'This is an interaction without description',
      },
    })
    pact.record(anInteraction)
    pact.record({
      ...anInteraction,
      description: 'This is a same description',
    })
    pact.record({
      ...anInteraction,
      description: 'This is a same description',
      request: { method: 'GET', path: 'v1/todo' },
    })
    pact.record({
      ...anInteraction,
      description: 'Description with special character @/"". $',
    })
    pact.record({
      ...anInteraction,
      description: 'This is an interaction with matching rules',
      request: {
        ...anInteraction.request,
        matchingRules: { '$.body': { match: 'type' } },
      },
    })
    pact.record({
      ...anInteraction,
      description: 'This is an interaction with headers and base path',
      request: {
        ...anInteraction.request,
        path: 'base/v1/todo',
        headers: {
          'content-type': 'application/json',
          Authorization: 'Bearer xxx',
        },
      },
    })

    const pactFile = pact.generatePactFile()
    expect(omitVersion(pactFile)).toMatchSnapshot()
  })
})

describe('PactV3', () => {
  const pact = new Pact<PactV3.PactFile>({
    consumer: { name: 'consumer' },
    provider: { name: 'provider' },
    metadata: { pactSpecification: { version: '3.0.0' } },
  })

  afterEach(() => {
    pact.reset()
  })

  it('should record a Pact V3 Interactions ', () => {
    // given

    const anInteraction = {
      description: 'This is a description',
      request: { method: 'POST', path: 'v1/todo', body: { name: 'Todo' } },
      response: {
        status: 200,
        body: 'This is an interaction with a description',
      },
    } as PactV3.Interaction

    // when
    pact.record({
      request: { method: 'GET', path: 'v1/todo' },
      response: {
        status: 200,
        body: 'This is an interaction without description',
      },
    })
    pact.record(anInteraction)
    pact.record({
      ...anInteraction,
      description: 'This is a same description',
    })
    pact.record({
      ...anInteraction,
      description: 'This is a same description',
      request: { method: 'GET', path: 'v1/todo' },
    })
    pact.record({
      ...anInteraction,
      description: 'Description with special character @/"". $',
    })
    pact.record({
      ...anInteraction,
      description: 'This is an interaction with matching rules',
      request: {
        ...anInteraction.request,
        matchingRules: { body: { match: 'type' } },
      },
    })

    const pactFile = pact.generatePactFile()
    expect(omitVersion(pactFile)).toMatchSnapshot()
  })
})

describe('PactV4', () => {
  const pact = new Pact<PactV4.PactFile>({
    consumer: { name: 'consumer' },
    provider: { name: 'provider' },
    metadata: { pactSpecification: { version: '4.0.0' } },
  })

  afterEach(() => {
    pact.reset()
  })

  it('should record a Pact V4 Interactions ', () => {
    // given

    const anInteraction = {
      type: 'Synchronous/HTTP',
      description: 'This is a description',
      request: {
        method: 'POST',
        path: 'v1/todo',
        body: { content: { name: 'Todo' }, contentType: 'application/json' },
      },
      response: {
        body: {
          content: 'This is an interaction with a description',
          contentType: 'application/json',
        },
      },
    } as PactV4.Interaction

    // when
    pact.record({
      request: { method: 'GET', path: 'v1/todo' },
      response: {
        status: 200,
        body: {
          content: 'This is an interaction without description',
          contentType: 'application/json',
        },
      },
    })
    pact.record(anInteraction)
    pact.record({
      ...anInteraction,
      description: 'This is a same description',
    })
    pact.record({
      ...anInteraction,
      description: 'This is a same description',
      request: { method: 'GET', path: 'v1/todo' },
    })
    pact.record({
      ...anInteraction,
      description: 'Description with special character @/"". $',
    })
    pact.record({
      ...anInteraction,
      description: 'This is an interaction with matching rules',
      request: {
        ...anInteraction.request,
        matchingRules: { body: { match: 'type' } },
      },
    })

    const pactFile = pact.generatePactFile()
    expect(omitVersion(pactFile)).toMatchSnapshot()
  })
})
