const { PORT } = require('./common/config');
const app = require('./app');

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  }
  console.log(`App is running on http://localhost:${PORT}`);
});
