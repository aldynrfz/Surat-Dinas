import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenvConfig();

// Environment schema validation
const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3001'),
    API_URL: z.string().url().default('http://localhost:3001'),

    // Firebase
    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_PRIVATE_KEY: z.string(),
    FIREBASE_CLIENT_EMAIL: z.string().email(),
    FIREBASE_API_KEY: z.string().optional(),
    FIREBASE_AUTH_DOMAIN: z.string().optional(),
    FIREBASE_STORAGE_BUCKET: z.string().optional(),

    // Frontend
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),

    // File Storage
    UPLOAD_DIR: z.string().default('uploads'),
    MAX_FILE_SIZE: z.string().default('5242880'),

    // LibreOffice
    LIBREOFFICE_PATH: z.string().optional(),

    // Google Drive (Service Account)
    GOOGLE_PROJECT_ID: z.string().optional(),
    GOOGLE_PRIVATE_KEY_ID: z.string().optional(),
    GOOGLE_PRIVATE_KEY: z.string().optional(),
    GOOGLE_CLIENT_EMAIL: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_DRIVE_FOLDER_ID: z.string().optional(),
});

const env = envSchema.parse(process.env);

export const config = {
    env: env.NODE_ENV,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',

    server: {
        port: parseInt(env.PORT),
        apiUrl: env.API_URL,
    },

    firebase: {
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey: env.FIREBASE_PRIVATE_KEY,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        apiKey: env.FIREBASE_API_KEY,
        authDomain: env.FIREBASE_AUTH_DOMAIN,
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
    },

    cors: {
        origin: env.FRONTEND_URL,
    },

    uploads: {
        dir: env.UPLOAD_DIR,
        maxFileSize: parseInt(env.MAX_FILE_SIZE),
    },

    libreOffice: {
        path: env.LIBREOFFICE_PATH || 'libreoffice',
    },

    googleDrive: {
        projectId: env.GOOGLE_PROJECT_ID,
        privateKeyId: env.GOOGLE_PRIVATE_KEY_ID,
        privateKey: env.GOOGLE_PRIVATE_KEY,
        clientEmail: env.GOOGLE_CLIENT_EMAIL,
        clientId: env.GOOGLE_CLIENT_ID,
        folderId: env.GOOGLE_DRIVE_FOLDER_ID,
    },
} as const;
