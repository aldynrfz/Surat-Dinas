import admin from 'firebase-admin';
import { config } from './env';

// Initialize Firebase Admin SDK
try {
    // Handle private key - replace literal \n with actual newlines
    const privateKey = config.firebase.privateKey
        ? config.firebase.privateKey.replace(/\\n/g, '\n')
        : '';

    const serviceAccount = {
        projectId: config.firebase.projectId,
        privateKey: privateKey,
        clientEmail: config.firebase.clientEmail,
    };

    // Debug log (remove in production)
    console.log('🔧 Initializing Firebase Admin with:');
    console.log('  Project ID:', serviceAccount.projectId);
    console.log('  Client Email:', serviceAccount.clientEmail);
    console.log('  Private Key Length:', privateKey.length);
    console.log('  Private Key starts with:', privateKey.substring(0, 27));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: config.firebase.storageBucket,
    });

    console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    throw error;
}

// Export Firestore instance
export const db = admin.firestore();

// Export Firebase Auth instance
export const auth = admin.auth();

// Export Firebase Storage instance
export const storage = admin.storage();

// Collections reference
export const collections = {
    users: 'users',
    schools: 'schools',
    students: 'students',
    employees: 'employees',
    studyGroups: 'study_groups',
    letters: 'letters',
    leaveRecords: 'leave_records',
    letterTemplates: 'letter_templates',
} as const;

export default admin;
