# Surat Dinas API Backend (Firebase)

Backend API server for the Surat Dinas (Official Letter Management) application.

## Tech Stack

- **Framework**: Express.js with TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication  
- **Document Generation**: docxtemplater + LibreOffice
- **Validation**: Zod
- **Storage**: Firebase Storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- LibreOffice (for PDF conversion)

### Installation

1. Install dependencies:
```bash
cd packages/api
npm install
```

2. Set up Firebase:
- Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
- Enable Firestore Database
- Enable Authentication (Email/Password)
- Enable Firebase Storage
- Generate a service account key (Project Settings > Service Accounts > Generate New Private Key)

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

4. Add your Firebase service account credentials to `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
```

### Development

```bash
npm run dev
```

Server will run on `http://localhost:3001`

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Type check without building

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── env.ts       # Environment validation
│   ├── firebase.ts  # Firebase Admin SDK setup
│   └── logger.ts    # Winston logger
├── middleware/      # Express middleware
│   ├── auth.middleware.ts   # Firebase Auth middleware
│   └── error.middleware.ts  # Error handling
├── routes/          # API route handlers (to be created)
├── services/        # Business logic layer
│   ├── student.service.ts
│   ├── employee.service.ts
│   ├── letter.service.ts
│   ├── school.service.ts
│   └── study-group.service.ts
├── utils/           # Utility functions
│   └── response.ts  # Response helpers
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Firestore Collections

The application uses the following Firestore collections:

- `users` - User accounts with roles
- `schools` - School profile information
- `students` - Student records
- `employees` - Employee/teacher records
- `study_groups` - Class/group information
- `letters` - Generated letters
- `leave_records` - Employee leave tracking
- `letter_templates` - Document templates

## API Documentation

API runs on `/api/v1` prefix.

- **Health Check**: `GET /health`
- Full API documentation coming soon

## Authentication

The API uses Firebase Authentication with custom claims for role-based access control.

### Protected Routes

Use the `authMiddleware` to protect routes:

```typescript
import { authMiddleware } from './middleware/auth.middleware';

router.get('/protected', authMiddleware, (req, res) => {
  // req.user contains { uid, email, role }
});
```

### Role-based Authorization

```typescript
import { roleMiddleware } from './middleware/auth.middleware';

router.post('/admin-only',
  authMiddleware,
  roleMiddleware(['admin']),
  (req, res) => {
    // Only admin users can access
  }
);
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Service account private key
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS

## Firebase Security Rules

Remember to set up Firestore security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## License

ISC
