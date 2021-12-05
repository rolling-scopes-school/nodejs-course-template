const usersSchema = {
  body: {
    type: 'object',
    required: ['name', 'login', 'password'],
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        minLength: 1,
      },
      login: {
        type: 'string',
        minLength: 1,
      },
      password: {
        type: 'string',
        minLength: 1,
      },
    },
  },
};

module.exports = usersSchema;
