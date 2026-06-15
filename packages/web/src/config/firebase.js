import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase Configuration
// Ganti dengan kredensial Firebase Anda
const firebaseConfig = {
    apiKey: "AIzaSyAyxev8xeIQWaCiIOJWyoVn6qbikkgkOO0",
    authDomain: "surat-dinas-b8b11.firebaseapp.com",
    projectId: "surat-dinas-b8b11",
    storageBucket: "surat-dinas-b8b11.firebasestorage.app",
    messagingSenderId: "256633868864",
    appId: "1:256633868864:web:462104da075f459d7305a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
export default app;
