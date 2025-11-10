export const todosWillRaiseTechnicalFailure = {
  statusCode: 500,
}

export const emptyTodos = {
  statusCode: 200,
  body: [],
}

export const multipleTodos = [
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
]

export const todoByIdFound = {
  statusCode: 200,
  body: {
    id: '1',
    title: 'Buy groceries',
    description: 'Milk, bread, eggs, cheese',
    completed: false,
    ownerId: 'user-1',
  },
}

export const todoByIdNotFound = {
  statusCode: 404,
  body: { message: 'The todo item 1 is not found' },
}

export const createTodoWillSucceed = {
  statusCode: 201,
  body: {
    id: '1',
    title: 'Buy groceries',
    description: 'Milk, bread, eggs, cheese',
    completed: false,
    ownerId: 'user-1',
  },
}

export const userByIdFound = {
  statusCode: 200,
  body: {
    id: 'user-1',
    name: 'Alice Smith',
    email: 'alice@example.com',
  },
}
