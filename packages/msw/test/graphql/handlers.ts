import { Pact } from '@pact-mock-js/msw'
import { GraphQLError } from 'graphql'
import { graphql } from 'msw'

export const pact = new Pact(
  {
    consumer: { name: 'test-consumer' },
    provider: { name: 'graphql-provider' },
    metadata: { pactSpecification: { version: '2.0.0' } },
  },
  {
    outputDir: 'pacts/graphql',
    headersConfig: {
      includes: ['content-type'],
    },
  }
)
export const todosWillRaiseTechnicalFailure = graphql.query(
  'todos',
  async (req, res, ctx) => {
    res(
      ...(await pact.toTransformers(
        {
          providerState: 'will return a 500 http error',
          description: 'graphql api returns a 500 http error',
          response: {
            status: 500,
          },
        },
        req,
        ctx
      ))
    )
  }
)
export const emptyTodos = graphql.query('todos', async (req, res, ctx) =>
  res(
    ...(await pact.toTransformers(
      {
        description: 'empty todo list',
        response: {
          status: 200,
          body: {
            data: {
              todos: [],
            },
          },
        },
      },
      req,
      ctx
    ))
  )
)

export const multipleTodos = graphql.query('todos', async (req, res, ctx) =>
  res(
    ...(await pact.toTransformers(
      {
        description: 'multiple todo list',
        response: {
          status: 200,
          body: {
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
          },
        },
      },
      req,
      ctx
    ))
  )
)

export const todoByIdFound = graphql.query('todoById', async (req, res, ctx) =>
  res(
    ...(await pact.toTransformers(
      {
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
      },
      req,
      ctx
    ))
  )
)

export const todoByIdNotFound = graphql.query(
  'todoById',
  async (req, res, ctx) =>
    res(
      ...(await pact.toTransformers(
        {
          description: 'should not found a todo item by its id',
          response: {
            status: 200,
            body: {
              errors: [
                { message: 'The todo item 1 is not found' } as GraphQLError,
              ],
            },
          },
        },
        req,
        ctx
      ))
    )
)

export const createTodoWillSucceed = graphql.mutation(
  'createTodo',
  async (req, res, ctx) =>
    res(
      ...(await pact.toTransformers(
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
        req,
        ctx
      ))
    )
)