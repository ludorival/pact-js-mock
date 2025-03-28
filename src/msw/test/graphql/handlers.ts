import { GraphQLError } from 'graphql'
import { graphql, http } from 'msw'
import { Pact } from '../../pact'

export const pact = new Pact(
  {
    consumer: { name: 'test-consumer' },
    provider: { name: 'graphql-provider' },
    metadata: { pactSpecification: { version: '2.0.0' } },
  },
  {
    headersConfig: {
      includes: ['content-type'],
    },
  },
)
export const todosWillRaiseTechnicalFailure = http.post(
  '*/graphql',
  pact.toResolver({
    providerState: 'will return a 500 http error',
    description: 'graphql api returns a 500 http error',
    response: {
      status: 500,
    },
  }),
)
export const emptyTodos = graphql.query(
  'todos',
  pact.toResolver({
    description: 'empty todo list',
    response: {
      status: 200,
      body: {
        data: {
          todos: [],
        },
      },
    },
  }),
)
// I can pass directly the body here, the status and description will be resolved automatically
export const multipleTodos = graphql.query(
  'todos',
  pact.toResolver({
    data: {
      todos: [
        {
          id: '1',
          title: 'Buy groceries',
          description: 'Milk, bread, eggs, cheese',
          completed: false,
        },
        {
          id: '2',
          title: 'Do laundry',
          description: '',
          completed: true,
        },
        {
          id: '3',
          title: 'Call plumber',
          description: 'Fix leaky faucet in the bathroom',
          completed: false,
        },
      ],
    },
  }),
)

export const todoByIdFound = graphql.query(
  'todoById',
  pact.toResolver({
    description: 'should found a todo item by its id',
    providerState: 'there is an existing todo item with this id',
    response: {
      status: 200,
      body: {
        data: {
          todoById: {
            id: '1',
            title: 'Buy groceries',
            description: 'Milk, bread, eggs, cheese',
            completed: false,
          },
        },
      },
    },
  }),
)

export const todoByIdNotFound = graphql.query(
  'todoById',
  pact.toResolver({
    description: 'should not found a todo item by its id',
    response: {
      status: 200,
      body: {
        errors: [{ message: 'The todo item 1 is not found' } as GraphQLError],
      },
    },
  }),
)
// I can use the transformers, if I want to add my own transform

export const createTodoWillSucceed = graphql.mutation(
  'createTodo',
  async (info) =>
    pact.toResponse(
      {
        description: 'should create a Todo with success',
        response: {
          status: 200,
          body: {
            data: {
              createTodo: {
                id: '1',
                title: 'Buy groceries',
                description: 'Milk, bread, eggs, cheese',
                completed: false,
              },
            },
          },
        },
      },
      info,
    ),
)
