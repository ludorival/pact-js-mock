import {
  pactGraphql as graphql,
  pactHttp as http,
  HttpResponse,
} from '../../index'

export const todosWillRaiseTechnicalFailure = http.post(
  '*/graphql',
  () => HttpResponse.json(null, { status: 500 }),
  {
    providerState: 'will return a 500 http error',
    description: 'graphql api returns a 500 http error',
  },
)

export const emptyTodos = graphql.query('todos', () =>
  HttpResponse.json({ data: { todos: [] } }, { status: 200 }),
)
// I can pass directly the body here, the status and description will be resolved automatically
export const multipleTodos = graphql.query('todos', () =>
  HttpResponse.json({
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

export const todoByIdFound = graphql.query('todoById', () =>
  HttpResponse.json(
    {
      data: {
        todoById: {
          id: '1',
          title: 'Buy groceries',
          description: 'Milk, bread, eggs, cheese',
          completed: false,
        },
      },
    },
    { status: 200 },
  ),
)

export const todoByIdNotFound = graphql.query('todoById', () =>
  HttpResponse.json(
    {
      errors: [{ message: 'The todo item 1 is not found' }],
    },
    { status: 200 },
  ),
)

export const createTodoWillSucceed = graphql.mutation('createTodo', () =>
  HttpResponse.json(
    {
      data: {
        createTodo: {
          id: '1',
          title: 'Buy groceries',
          description: 'Milk, bread, eggs, cheese',
          completed: false,
        },
      },
    },
    { status: 200 },
  ),
)
