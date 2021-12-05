const User = require('./users.model');
const usersService = require('./users.service');
const usersSchema = require('./users.schema');

const usersRoutes = (fastify, opts, done) => {
  fastify.get('/users', opts, async (request, reply) => {
    const users = await usersService.getAll();
    reply.code(200).type('application/json').send(users.map(User.toResponse));
  });

  fastify.get('/users/:userId', opts, async (request, reply) => {
    const user = await usersService.getById(request.params.userId);
    reply.code(200).type('application/json').send(User.toResponse(user));
  });

  fastify.post(
    '/users',
    { ...opts, schema: usersSchema },
    async (request, reply) => {
      const createdUser = await usersService.create(request.body);
      reply
        .code(201)
        .type('application/json')
        .send(User.toResponse(createdUser));
    }
  );

  fastify.put(
    '/users/:userId',
    { ...opts, schema: usersSchema },
    async (request, reply) => {
      const user = await usersService.updateById(
        request.params.userId,
        request.body
      );
      reply.code(200).type('application/json').send(User.toResponse(user));
    }
  );

  fastify.delete('/users/:userId', opts, async (request, reply) => {
    await usersService.deleteById(request.params.userId);
    reply.code(204);
  });

  done();
};

module.exports = usersRoutes;
