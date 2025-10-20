import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { initializeDatabase } from './db/init';
import { registerAuthRoutes } from './routes/auth';
import { registerTaskRoutes } from './routes/tasks';
import { registerCustomerRoutes } from './routes/customers';
import { registerInvoiceRoutes } from './routes/invoices';
import { registerAnalyticsRoutes } from './routes/analytics';
import { registerCalendarRoutes } from './routes/calendar';
import { scheduleReminders } from './utils/scheduler';

const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true, env: env.nodeEnv });
});

registerAuthRoutes(app);
registerTaskRoutes(app);
registerCustomerRoutes(app);
registerInvoiceRoutes(app);
registerAnalyticsRoutes(app);
registerCalendarRoutes(app);

async function start() {
  await initializeDatabase();
  scheduleReminders();
  app.listen(env.port, () => {
    console.log(`API server listening on http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
