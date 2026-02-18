import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { migrate } from './db/database';
import authRoutes from './routes/auth';
import recipeRoutes from './routes/recipes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize DB and start server
migrate();
app.listen(PORT, () => {
  console.log(`🍳 CookShare Backend running on http://localhost:${PORT}`);
});

export default app;
