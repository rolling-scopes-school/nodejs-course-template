import * as express from 'express';
import * as swaggerUI from 'swagger-ui-express';
import * as path from 'path';
import * as YAML from 'yamljs';
import userRouter from './resources/users/user.router';

const app: express.Express = express();
const swaggerDocument = YAML.load(path.join(__dirname, '../doc/api.yaml'));
// const swaggerDocument = YAML.load('../doc/api.yaml');
app.use(express.json());

app.use('/api', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use('/', async (req, res, next) => {
  if (req.originalUrl === '/') {
    res.send('Service is running!');
    return;
  }
  next();
});

app.use('/', userRouter);
// registerUserRouter(app);

export default app;
