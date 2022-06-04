import express from 'express';
import swaggerUI from 'swagger-ui-express';
import path from 'path';
import YAML from 'yamljs';
import userRouter from './resources/users/user.router';

const app: express.Express = express();
const swaggerDocument = YAML.load(
  path.join(__dirname, '../doc/library_api.yaml')
);

app.use(express.json());

app.use('/api/doc', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use('/', async (req, res, next) => {
  if (req.originalUrl === '/') {
    res.send('Service is running!');
    return;
  }
  next();
});

app.use('/', userRouter);

export default app;
