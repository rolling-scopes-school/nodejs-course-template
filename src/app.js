const fastify = require('fastify');

const app = fastify({
  logger: true,
});

app.register(require('./resources/tasks/tasks.routes'));
app.register(require('./resources/users/users.routes'));
app.register(require('./resources/boards/boards.routes'));

module.exports = app;
