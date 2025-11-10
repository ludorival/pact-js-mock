import { pactHttp as http, HttpResponse } from '../../'
// import { http, HttpResponse } from 'msw'
export const todosWillRaiseTechnicalFailure = http.get(
  '*/todo-service/todos',

  () => {
    return HttpResponse.json(null, { status: 500 })
  },
  {
    providerState: 'will return a 500 http error',
    description: 'rest api returns a 500 http error',
  },
)

export const emptyTodos = http.get('*/todo-service/todos', () => {
  return HttpResponse.json([])
})

export const multipleTodos = http.get('*/todo-service/todos', () => {
  return HttpResponse.json([
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
  ])
})

export const todoByIdFound = http.get(
  '*/todo-service/todos/*',
  () => {
    return HttpResponse.json({
      id: '1',
      title: 'Buy groceries',
      description: 'Milk, bread, eggs, cheese',
      completed: false,
      ownerId: 'user-1',
    })
  },
  {
    providerState: 'there is an existing todo item with this id',
    description: 'should found a todo item by its id',
  },
)

export const todoByIdNotFound = http.get('*/todo-service/todos/*', () => {
  return HttpResponse.json(
    { message: 'The todo item 1 is not found' },
    { status: 404 },
  )
})

export const createTodoWillSucceed = http.post(
  '*/todo-service/todos',
  async () => {
    return HttpResponse.json(
      {
        id: '1',
        title: 'Buy groceries',
        description: 'Milk, bread, eggs, cheese',
        completed: false,
        ownerId: 'user-1',
      },
      { status: 201 },
    )
  },
)

export const userByIdFound = http.get('*/user-service/users/*', () => {
  return HttpResponse.json({
    id: 'user-1',
    name: 'Alice Smith',
    email: 'alice@example.com',
  })
})
