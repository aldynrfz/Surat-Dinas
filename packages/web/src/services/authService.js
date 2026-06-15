import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Re-export for backward compatibility if needed, or internal use
export { auth, db };

/**
 * Register new user with email and password
 */
export const registerUser = async (email, password, displayName, additionalData = {}) => {
    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        if (displayName) {
            await updateProfile(user, { displayName });
        }

        // Create user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: displayName || '',
            role: additionalData.role || 'staff', // default role
            schoolId: additionalData.schoolId || null,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: displayName || '',
            },
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code),
        };
    }
};

/**
 * Login user with email and password
 */
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        let userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
        };

        if (userDoc.exists()) {
            userData = { ...userData, ...userDoc.data() };
        }

        return {
            success: true,
            user: userData,
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code),
        };
    }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return {
            success: true,
        };
    } catch (error) {
        console.error('Logout error:', error);
        return {
            success: false,
            error: getErrorMessage(error.code),
        };
    }
};

/**
 * Get current user data from Firestore
 */
export const getCurrentUserData = async (uid) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return {
                success: true,
                user: userDoc.data(),
            };
        }

        return {
            success: false,
            error: 'User data not found',
        };
    } catch (error) {
        console.error('Get user data error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

/**
 * Subscribe to authentication state changes
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Get user-friendly error messages
 */
const getErrorMessage = (errorCode) => {
    const errorMessages = {
        'auth/email-already-in-use': 'Email sudah terdaftar',
        'auth/invalid-email': 'Format email tidak valid',
        'auth/operation-not-allowed': 'Operasi tidak diizinkan',
        'auth/weak-password': 'Password terlalu lemah (minimal 6 karakter)',
        'auth/user-disabled': 'Akun ini telah dinonaktifkan',
        'auth/user-not-found': 'Email tidak terdaftar',
        'auth/wrong-password': 'Password salah',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti',
        'auth/network-request-failed': 'Kesalahan jaringan. Periksa koneksi internet Anda',
    };

    return errorMessages[errorCode] || 'Terjadi kesalahan. Silakan coba lagi';
};

export default {
    auth,
    db,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUserData,
    onAuthChange,
};
