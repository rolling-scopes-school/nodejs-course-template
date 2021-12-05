const fastify = require('fastify');

const app = fastify({
  logger: true,
});

app.register(require('./resources/users/users.routes'));

module.exports = app;
