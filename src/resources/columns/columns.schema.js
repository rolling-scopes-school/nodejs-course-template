const columnsSchema = {
  type: 'object',
  required: ['title', 'order'],
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
  },
};

module.exports = columnsSchema;
