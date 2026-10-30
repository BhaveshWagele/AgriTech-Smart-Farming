import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { initializeDatabase } from './server/db/database.ts';
import authRoutes from './server/routes/authRoutes.ts';
import farmRoutes from './server/routes/farmRoutes.ts';
import cropRoutes from './server/routes/cropRoutes.ts';
import soilRoutes from './server/routes/soilRoutes.ts';
import weatherRoutes from './server/routes/weatherRoutes.ts';
import pestRoutes from './server/routes/pestRoutes.ts';
import marketplaceRoutes from './server/routes/marketplaceRoutes.ts';
import consultationRoutes from './server/routes/consultationRoutes.ts';
import communityRoutes from './server/routes/communityRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Basic Middlewares
  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Initialize Database connection / local collections
  await initializeDatabase();

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      platform: 'AgriTech – Smart Farming Management System',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Modules
  app.use('/api/auth', authRoutes);
  app.use('/api/farms', farmRoutes);
  app.use('/api/crops', cropRoutes);
  app.use('/api/soil', soilRoutes);
  app.use('/api/weather', weatherRoutes);
  app.use('/api/pest', pestRoutes);
  app.use('/api/marketplace', marketplaceRoutes);
  app.use('/api/consultations', consultationRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);

  // Vite Integration
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[AgriTech Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[AgriTech Server] Fatal error starting server:', err);
  process.exit(1);
});
