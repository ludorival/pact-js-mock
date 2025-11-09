import { http } from 'msw'
import { Pact } from '../../pact'

export const pact = new Pact(
  {
    consumer: { name: 'test-consumer' },
    provider: { name: 'todo-service' },
    metadata: { pactSpecification: { version: '2.0.0' } },
  },
  {
    basePath: '/todo-service',
    headersConfig: {
      includes: ['content-type'],
    },
  },
)
export const todosWillRaiseTechnicalFailure = http.get(
  '*/todo-service/todos',
  pact.toResolver({
    providerState: 'will return a 500 http error',
    description: 'rest api returns a 500 http error',
    response: {
      status: 500,
    },
  }),
)
export const emptyTodos = http.get(
  '*/todo-service/todos',
  pact.toResolver({
    description: 'empty todo list',
    response: {
      status: 200,
      body: [],
    },
  }),
)
// I can pass directly the body here, the status and description will be resolved automatically
export const multipleTodos = http.get(
  '*/todo-service/todos',
  pact.toResolver([
    {
      id: '1',
      title: 'Buy groceries',
      description: 'Milk, bread, eggs, cheese',
      completed: false,
      ownerId: 'user-1',
    },
    {
      id: '2',
      title: 'Do laundry',
      description: '',
      completed: true,
      ownerId: 'user-2',
    },
    {
      id: '3',
      title: 'Call plumber',
      description: 'Fix leaky faucet in the bathroom',
      completed: false,
      ownerId: 'user-3',
    },
  ]),
)

export const todoByIdFound = http.get(
  '*/todo-service/todos/*',
  pact.toResolver({
    description: 'should found a todo item by its id',
    providerState: 'there is an existing todo item with this id',
    response: {
      status: 200,
      body: {
        id: '1',
        title: 'Buy groceries',
        description: 'Milk, bread, eggs, cheese',
        completed: false,
        ownerId: 'user-1',
      },
    },
  }),
)

export const todoByIdNotFound = http.get(
  '*/todo-service/todos/*',
  pact.toResolver({
    description: 'should not found a todo item by its id',
    response: {
      status: 404,
      body: { message: 'The todo item 1 is not found' },
    },
  }),
)
// I can use the transformers, if I want to add my own transform
export const createTodoWillSucceed = http.post(
  '*/todo-service/todos',
  async (info) =>
    await pact.toResponse(
      {
        description: 'should create a Todo with success',
        response: {
          status: 201,
          body: {
            id: '1',
            title: 'Buy groceries',
            description: 'Milk, bread, eggs, cheese',
            completed: false,
            ownerId: 'user-1',
          },
        },
      },
      info,
    ),
)

export const userServicePact = new Pact(
  {
    consumer: { name: 'test-consumer' },
    provider: { name: 'user-service' },
    metadata: { pactSpecification: { version: '2.0.0' } },
  },
  {
    basePath: '/user-service',
    headersConfig: {
      includes: ['content-type'],
    },
  },
)

export const userByIdFound = http.get(
  '*/user-service/users/*',
  userServicePact.toResolver({
    description: 'user is available',
    response: {
      status: 200,
      body: {
        id: 'user-1',
        name: 'Alice Smith',
        email: 'alice@example.com',
      },
    },
  }),
)
