const tasksService = require('./tasks.service');
const tasksSchema = require('./tasks.schema');

const tasksRoutes = (fastify, opts, done) => {
  fastify.get('/boards/:boardId/tasks', opts, async (request, reply) => {
    const tasks = await tasksService.getAll(request.params.boardId);
    reply.code(200).type('application/json').send(tasks);
  });

  fastify.get(
    '/boards/:boardId/tasks/:taskId',
    opts,
    async (request, reply) => {
      const task = await tasksService.getById(
        request.params.boardId,
        request.params.taskId
      );
      reply.code(200).type('application/json').send(task);
    }
  );

  fastify.post(
    '/boards/:boardId/tasks',
    { ...opts, schema: { body: tasksSchema } },
    async (request, reply) => {
      const createdTask = await tasksService.create(
        request.params.boardId,
        request.body
      );
      reply.code(201).type('application/json').send(createdTask);
    }
  );

  fastify.put(
    '/boards/:boardId/tasks/:taskId',
    { ...opts, schema: { body: tasksSchema } },
    async (request, reply) => {
      const task = await tasksService.updateById(
        request.params.boardId,
        request.params.taskId,
        request.body
      );
      reply.code(200).type('application/json').send(task);
    }
  );

  fastify.delete(
    '/boards/:boardId/tasks/:taskId',
    opts,
    async (request, reply) => {
      await tasksService.deleteById(
        request.params.boardId,
        request.params.taskId
      );
      reply.code(204);
    }
  );

  done();
};

module.exports = tasksRoutes;
