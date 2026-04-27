import { handle } from 'hono/netlify';
import { app } from '../../apps/backend/src/app.js';

export const handler = handle(app);
