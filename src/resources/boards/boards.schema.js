const columnsSchema = require('../columns/columns.schema');

const boardsSchema = {
  type: 'object',
  required: ['title', 'columns'],
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      minLength: 1,
    },
    columns: {
      type: 'array',
      minLength: 0,
      items: columnsSchema,
    },
  },
};

module.exports = boardsSchema;
