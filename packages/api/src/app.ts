import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: config.cors.origin,
        credentials: true,
    })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (config.isDevelopment) {
    app.use((req, _res, next) => {
        logger.debug(`${req.method} ${req.path}`, {
            query: req.query,
            body: req.body,
        });
        next();
    });
}

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
import letterRoutes from './services/letter.routes';
import driveRoutes from './services/drive.routes';
app.use('/api/letters', letterRoutes);
app.use('/api/drive', driveRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
