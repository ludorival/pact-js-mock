export const todosWillRaiseTechnicalFailure = {
  statusCode: 500,
}

export const emptyTodos = {
  statusCode: 200,
  body: {
    data: {
      todos: [],
    },
  },
}

export const multipleTodos = {
  statusCode: 200,
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
}

export const todoByIdFound = {
  statusCode: 200,
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
}

export const todoByIdNotFound = {
  statusCode: 200,
  body: {
    errors: [{ message: 'The todo item 1 is not found' }],
  },
}

export const createTodoWillSucceed = {
  statusCode: 200,
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
}
