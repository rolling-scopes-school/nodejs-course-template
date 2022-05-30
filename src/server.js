const { PORT } = require('./common/config');
const app = require('./app');

app.listen(PORT, () =>
  // eslint-disable-next-line no-console
  console.log(`App is running on http://localhost:${PORT}`)
);
