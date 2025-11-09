export const todosWillRaiseTechnicalFailure = {
  operationName: 'todos',
  providerState: 'will return a 500 http error',
  description: 'graphql api returns a 500 http error',
  response: {
    status: 500,
  },
}

export const emptyTodos = {
  description: 'empty todo list',
  response: {
    status: 200,
    body: {
      data: {
        todos: [],
      },
    },
  },
}

export const multipleTodos = {
  description: 'should list todo items using GraphQL',
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
}

export const todoByIdFound = {
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
}

export const todoByIdNotFound = {
  description: 'should not found a todo item by its id',
  response: {
    status: 200,
    body: {
      errors: [{ message: 'The todo item 1 is not found' }],
    },
  },
}

export const createTodoWillSucceed = {
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
}
