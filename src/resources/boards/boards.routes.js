const boardsService = require('./boards.service');
const boardsSchema = require('./boards.schema');
const Board = require('./boards.model');

const boardsRoutes = (fastify, opts, done) => {
  fastify.get('/boards', opts, async (request, reply) => {
    const boards = await boardsService.getAll();
    reply.code(200).type('application/json').send(boards.map(Board.toResponse));
  });

  fastify.get('/boards/:boardId', opts, async (request, reply) => {
    const board = await boardsService.getById(request.params.boardId);
    reply.code(200).type('application/json').send(Board.toResponse(board));
  });

  fastify.post(
    '/boards',
    { ...opts, schema: { body: boardsSchema } },
    async (request, reply) => {
      const createdBoard = await boardsService.create(request.body);
      reply
        .code(201)
        .type('application/json')
        .send(Board.toResponse(createdBoard));
    }
  );

  fastify.put(
    '/boards/:boardId',
    { ...opts, schema: { body: boardsSchema } },
    async (request, reply) => {
      const board = await boardsService.updateById(
        request.params.boardId,
        request.body
      );
      reply.code(200).type('application/json').send(Board.toResponse(board));
    }
  );

  fastify.delete('/boards/:boardId', opts, async (request, reply) => {
    await boardsService.deleteById(request.params.boardId);
    reply.code(204);
  });

  done();
};

module.exports = boardsRoutes;
