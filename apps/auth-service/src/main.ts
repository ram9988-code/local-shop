import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { errorMiddleware } from '@packages/error-handler/error-middleware';

import router from './routes/auth.route';
const swaggerDocument = require('./swagger_output.json');

//Server configuration
const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

//Routes
app.use('/api', router);

app.use(errorMiddleware);

const port = process.env.PORT || 6001;

const server = app.listen(port, () => {
  console.log(`Auth service is listening at http://localhost:${port}/api`);
  console.log(`Swagger UI is available at http://localhost:${port}/docs`);
});

server.on('error', (error) => {
  console.log('Server Error:', error);
});
