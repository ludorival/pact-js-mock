export const todosWillRaiseTechnicalFailure = {
  providerState: 'will return a 500 http error',
  description: 'rest api returns a 500 http error',
  response: {
    status: 500,
  },
}

export const emptyTodos = {
  description: 'empty todo list',
  response: {
    status: 200,
    body: [],
  },
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
}

export const todoByIdNotFound = {
  description: 'should not found a todo item by its id',
  response: {
    status: 404,
    body: { message: 'The todo item 1 is not found' },
  },
}

export const createTodoWillSucceed = {
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
}

export const userByIdFound = {
  description: 'should find the associated user',
  response: {
    status: 200,
    body: {
      id: 'user-1',
      name: 'Alice Smith',
      email: 'alice@example.com',
    },
  },
}
