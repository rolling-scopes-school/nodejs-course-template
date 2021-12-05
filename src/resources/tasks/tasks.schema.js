const tasksSchema = {
  type: 'object',
  required: ['title', 'order', 'description'],
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      minLength: 1,
    },
    order: {
      type: 'number',
      minimum: 0,
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    userId: {
      type: ['string', 'null'],
      minLength: 1,
    },
    boardId: {
      type: ['string', 'null'],
      minLength: 1,
    },
    columnId: {
      type: ['string', 'null'],
      minLength: 1,
    },
  },
};

module.exports = tasksSchema;
