import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import { db } from './config/firebase';

const PORT = config.server.port;

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
    logger.info('Shutting down gracefully...');
    process.exit(0);
}

// Start server
async function start() {
    try {
        // Test Firestore connection
        await db.listCollections();
        logger.info('Firebase Firestore connected successfully');

        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Environment: ${config.env}`);
            logger.info(`API URL: ${config.server.apiUrl}`);
            logger.info(`Firebase Project: ${config.firebase.projectId}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
