import express from 'express';
import morgan from 'morgan';
import storiesRoutes from './routes/stories.routes';

const app = express();

app.use(morgan('dev')); // Logging

storiesRoutes(app);

export default app;
