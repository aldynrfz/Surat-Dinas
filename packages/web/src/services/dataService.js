import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    getDoc,
    orderBy,
    limit,
    serverTimestamp,
    writeBatch,
    increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection References
const COLLECTIONS = {
    STUDENTS: 'students',
    EMPLOYEES: 'employees',
    STUDY_GROUPS: 'study_groups',
    LETTERS: 'letters',
    AGENDA_SURAT: 'agenda_surat',
    BMN: 'bmn',
    BMN_BORROWINGS: 'bmn_borrowings',
    LIBRARY_BOOKS: 'library_books',
    LIBRARY_BORROWINGS: 'library_borrowings',
};

// --- Students Service ---

export const getAllStudents = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.STUDENTS), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
    }
};

export const addStudent = async (studentData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
            ...studentData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding student:", error);
        throw error;
    }
};

export const addStudentsBatch = async (studentsData) => {
    try {
        const batch = writeBatch(db);
        const chunks = [];
        // Firestore batch limit is 500
        for (let i = 0; i < studentsData.length; i += 400) {
            chunks.push(studentsData.slice(i, i + 400));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach(student => {
                const docRef = doc(collection(db, COLLECTIONS.STUDENTS));
                batch.set(docRef, {
                    ...student,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            });
            await batch.commit();
        }
        return true;
    } catch (error) {
        console.error("Error batch adding students:", error);
        throw error;
    }
};

export const updateStudent = async (id, studentData) => {
    try {
        const studentRef = doc(db, COLLECTIONS.STUDENTS, id);
        await updateDoc(studentRef, {
            ...studentData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating student:", error);
        throw error;
    }
};

export const deleteStudent = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTIONS.STUDENTS, id));
        return true;
    } catch (error) {
        console.error("Error deleting student:", error);
        throw error;
    }
};

// --- Employees Service ---

export const getAllEmployees = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.EMPLOYEES), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching employees:", error);
        throw error;
    }
};

export const addEmployee = async (employeeData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.EMPLOYEES), {
            ...employeeData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding employee:", error);
        throw error;
    }
};

export const deleteEmployee = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTIONS.EMPLOYEES, id));
        return true;
    } catch (error) {
        console.error("Error deleting employee:", error);
        throw error;
    }
};

export const updateEmployee = async (id, employeeData) => {
    try {
        const employeeRef = doc(db, COLLECTIONS.EMPLOYEES, id);
        await updateDoc(employeeRef, {
            ...employeeData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating employee:", error);
        throw error;
    }
};

export const addEmployeesBatch = async (employeesData) => {
    try {
        const chunks = [];
        for (let i = 0; i < employeesData.length; i += 400) {
            chunks.push(employeesData.slice(i, i + 400));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach(employee => {
                const docRef = doc(collection(db, COLLECTIONS.EMPLOYEES));
                batch.set(docRef, {
                    ...employee,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            });
            await batch.commit();
        }
        return true;
    } catch (error) {
        console.error("Error batch adding employees:", error);
        throw error;
    }
};

// --- Study Groups Service ---

export const getAllStudyGroups = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.STUDY_GROUPS), orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching study groups:", error);
        throw error;
    }
};

export const addStudyGroup = async (groupData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.STUDY_GROUPS), {
            ...groupData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding study group:", error);
        throw error;
    }
};

export const getStudyGroupById = async (id) => {
    try {
        const docRef = doc(db, COLLECTIONS.STUDY_GROUPS, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting study group:", error);
        throw error;
    }
};

export const updateStudyGroup = async (id, groupData) => {
    try {
        const groupRef = doc(db, COLLECTIONS.STUDY_GROUPS, id);
        await updateDoc(groupRef, {
            ...groupData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating study group:", error);
        throw error;
    }
};

export const deleteStudyGroup = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTIONS.STUDY_GROUPS, id));
        return true;
    } catch (error) {
        console.error("Error deleting study group:", error);
        throw error;
    }
};

export const getStudentsByGroupId = async (groupId) => {
    try {
        const q = query(collection(db, COLLECTIONS.STUDENTS), where('groupId', '==', groupId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching students by group:", error);
        throw error;
    }
};

export const addStudentToGroup = async (studentId, group, studentData) => {
    try {
        const batch = writeBatch(db);

        // Update Student
        const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
        batch.update(studentRef, {
            groupId: group.id,
            groupName: group.name,
            updatedAt: serverTimestamp()
        });

        // Update Group Counter
        const groupRef = doc(db, COLLECTIONS.STUDY_GROUPS, group.id);
        batch.update(groupRef, {
            studentCount: increment(1),
            updatedAt: serverTimestamp()
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error adding student to group:", error);
        throw error;
    }
};

export const removeStudentFromGroup = async (studentId, groupId) => {
    try {
        const batch = writeBatch(db);

        // Update Student
        const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
        batch.update(studentRef, {
            groupId: null,
            groupName: null,
            updatedAt: serverTimestamp()
        });

        // Update Group Counter (if groupId provided)
        if (groupId) {
            const groupRef = doc(db, COLLECTIONS.STUDY_GROUPS, groupId);
            batch.update(groupRef, {
                studentCount: increment(-1),
                updatedAt: serverTimestamp()
            });
        }

        await batch.commit();
        return true;
    } catch (error) {
        console.error("Error removing student from group:", error);
        throw error;
    }
};

// --- Letters Service ---

export const getAllLetters = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.LETTERS), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching letters:", error);
        throw error;
    }
};

export const getLetterById = async (id) => {
    try {
        const letterRef = doc(db, COLLECTIONS.LETTERS, id);
        const letterDoc = await getDoc(letterRef);
        if (!letterDoc.exists()) {
            throw new Error('Letter not found');
        }
        return {
            id: letterDoc.id,
            ...letterDoc.data()
        };
    } catch (error) {
        console.error("Error fetching letter by ID:", error);
        throw error;
    }
};

export const addLetter = async (letterData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.LETTERS), {
            ...letterData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding letter:", error);
        throw error;
    }
};

export const updateLetter = async (id, letterData) => {
    try {
        const letterRef = doc(db, COLLECTIONS.LETTERS, id);
        await updateDoc(letterRef, {
            ...letterData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating letter:", error);
        throw error;
    }
};

export const deleteLetter = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTIONS.LETTERS, id));
        return true;
    } catch (error) {
        console.error("Error deleting letter:", error);
        throw error;
    }
};

// --- Agenda Surat Services (Manual Entry) ---

export const getAgendas = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.AGENDA_SURAT), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting agendas:", error);
        throw error;
    }
};

export const addAgenda = async (agendaData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.AGENDA_SURAT), {
            ...agendaData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding agenda:", error);
        throw error;
    }
};

export const updateAgenda = async (id, agendaData) => {
    try {
        const agendaRef = doc(db, COLLECTIONS.AGENDA_SURAT, id);
        await updateDoc(agendaRef, {
            ...agendaData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating agenda:", error);
        throw error;
    }
};

export const deleteAgenda = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTIONS.AGENDA_SURAT, id));
    } catch (error) {
        console.error("Error deleting agenda:", error);
        throw error;
    }
};

// --- School Profile Service ---

export const getSchoolProfile = async () => {
    try {
        const q = query(collection(db, 'schools'), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null; // Return null if no profile exists
    } catch (error) {
        console.error("Error fetching school profile:", error);
        throw error;
    }
};

export const updateSchoolProfile = async (id, profileData) => {
    try {
        // If id is provided, update existing
        if (id) {
            const docRef = doc(db, 'schools', id);
            await updateDoc(docRef, {
                ...profileData,
                updatedAt: serverTimestamp()
            });
            return id;
        } else {
            // If no ID (first time setup scenario), create new
            const docRef = await addDoc(collection(db, 'schools'), {
                ...profileData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        }
    } catch (error) {
        console.error("Error updating school profile:", error);
        throw error;
    }
};

// --- Dashboard Stats ---

export const getDashboardStats = async () => {
    try {
        // In a real app with large data, we should use aggregation queries or dedicated stats counters.
        // For now, fetching counts directly is acceptable for starting point.
        const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
        const employeesSnap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
        const lettersSnap = await getDocs(collection(db, COLLECTIONS.LETTERS));
        const studyGroupsSnap = await getDocs(collection(db, COLLECTIONS.STUDY_GROUPS));
        const bmnSnap = await getDocs(collection(db, COLLECTIONS.BMN));
        const libraryBooksSnap = await getDocs(collection(db, COLLECTIONS.LIBRARY_BOOKS));

        // Count letters this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // This is a client-side filter for now, better to query by date range
        const lettersThisMonth = lettersSnap.docs.filter(doc => {
            const data = doc.data();
            const date = data.createdAt ? data.createdAt.toDate() : new Date();
            return date >= startOfMonth;
        }).length;

        return {
            totalStudents: studentsSnap.size,
            totalEmployees: employeesSnap.size,
            totalLetters: lettersSnap.size,
            totalStudyGroups: studyGroupsSnap.size,
            totalBMN: bmnSnap.size,
            totalLibraryBooks: libraryBooksSnap.size,
            lettersThisMonth: lettersThisMonth,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            totalStudents: 0,
            totalEmployees: 0,
            totalLetters: 0,
            totalStudyGroups: 0,
            totalBMN: 0,
            totalLibraryBooks: 0,
            lettersThisMonth: 0,
        };
    }
};

// --- BMN (Barang Milik Negara) Service ---

export const getAllBMN = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.BMN), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching BMN:", error);
        throw error;
    }
};

export const addBMN = async (bmnData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.BMN), {
            ...bmnData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding BMN:", error);
        throw error;
    }
};

export const updateBMN = async (id, bmnData) => {
    try {
        const bmnRef = doc(db, COLLECTIONS.BMN, id);
        await updateDoc(bmnRef, {
            ...bmnData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating BMN:", error);
        throw error;
    }
};

export const deleteBMN = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTIONS.BMN, id));
        return true;
    } catch (error) {
        console.error("Error deleting BMN:", error);
        throw error;
    }
};
// --- BMN Borrowings Service ---
export const getAllBmnBorrowings = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.BMN_BORROWINGS), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching BMN borrowings:", error);
        throw error;
    }
};

export const addBmnBorrowing = async (borrowingData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.BMN_BORROWINGS), {
            ...borrowingData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        // Update BMN status to 'dipinjam'
        if (borrowingData.bmnId) {
            const bmnRef = doc(db, COLLECTIONS.BMN, borrowingData.bmnId);
            await updateDoc(bmnRef, { status: 'dipinjam', updatedAt: serverTimestamp() });
        }
        
        return docRef.id;
    } catch (error) {
        console.error("Error adding BMN borrowing:", error);
        throw error;
    }
};

export const updateBmnBorrowing = async (borrowingId, updateData, oldBmnId, newBmnId) => {
    try {
        const borrowingRef = doc(db, COLLECTIONS.BMN_BORROWINGS, borrowingId);
        await updateDoc(borrowingRef, {
            ...updateData,
            updatedAt: serverTimestamp()
        });

        // If the BMN item was changed, update statuses
        if (oldBmnId !== newBmnId) {
            if (oldBmnId) {
                const oldBmnRef = doc(db, COLLECTIONS.BMN, oldBmnId);
                await updateDoc(oldBmnRef, { status: 'tersedia', updatedAt: serverTimestamp() });
            }
            if (newBmnId) {
                const newBmnRef = doc(db, COLLECTIONS.BMN, newBmnId);
                await updateDoc(newBmnRef, { status: 'dipinjam', updatedAt: serverTimestamp() });
            }
        }
    } catch (error) {
        console.error("Error updating BMN borrowing:", error);
        throw error;
    }
};

export const returnBmnBorrowing = async (borrowingId, bmnId, returnDate) => {
    try {
        const borrowingRef = doc(db, COLLECTIONS.BMN_BORROWINGS, borrowingId);
        await updateDoc(borrowingRef, {
            status: 'dikembalikan',
            tanggal_kembali: returnDate,
            updatedAt: serverTimestamp()
        });

        // Update BMN status back to 'tersedia'
        if (bmnId) {
            const bmnRef = doc(db, COLLECTIONS.BMN, bmnId);
            await updateDoc(bmnRef, { status: 'tersedia', updatedAt: serverTimestamp() });
        }
    } catch (error) {
        console.error("Error returning BMN borrowing:", error);
        throw error;
    }
};

export const deleteBmnBorrowing = async (borrowingId, bmnId, status) => {
    try {
        const docRef = doc(db, COLLECTIONS.BMN_BORROWINGS, borrowingId);
        await deleteDoc(docRef);
        
        // If the item was still 'dipinjam', set it back to 'tersedia' when borrowing record is deleted
        if (bmnId && status === 'dipinjam') {
            const bmnRef = doc(db, COLLECTIONS.BMN, bmnId);
            await updateDoc(bmnRef, { status: 'tersedia', updatedAt: serverTimestamp() });
        }
    } catch (error) {
        console.error("Error deleting BMN borrowing:", error);
        throw error;
    }
};

// --- Library Books Service ---

export const getAllLibraryBooks = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.LIBRARY_BOOKS), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching library books:", error);
        throw error;
    }
};

export const addLibraryBook = async (bookData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTIONS.LIBRARY_BOOKS), {
            ...bookData,
            status: 'tersedia', // Default status for new books
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding library book:", error);
        throw error;
    }
};

export const updateLibraryBook = async (id, bookData) => {
    try {
        const bookRef = doc(db, COLLECTIONS.LIBRARY_BOOKS, id);
        await updateDoc(bookRef, {
            ...bookData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error("Error updating library book:", error);
        throw error;
    }
};

export const deleteLibraryBook = async (id) => {
    try {
        await deleteDoc(doc(db, COLLECTIONS.LIBRARY_BOOKS, id));
        return true;
    } catch (error) {
        console.error("Error deleting library book:", error);
        throw error;
    }
};

// --- Library Borrowings Service ---

export const getAllLibraryBorrowings = async () => {
    try {
        const q = query(collection(db, COLLECTIONS.LIBRARY_BORROWINGS), orderBy('tanggal_pinjam', 'desc'));
        const querySnapshot = await getDocs(q);

        // Fetch book details manually to populate them
        const borrowings = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        const populatedBorrowings = await Promise.all(borrowings.map(async (borrowing) => {
            // Support new multi-book format (bookIds array) AND legacy single bookId
            const ids = borrowing.bookIds || (borrowing.bookId ? [borrowing.bookId] : []);
            if (ids.length > 0) {
                try {
                    const bookDocs = await Promise.all(
                        ids.map(async (bid) => {
                            const bookRef = doc(db, COLLECTIONS.LIBRARY_BOOKS, bid);
                            const bookSnap = await getDoc(bookRef);
                            return bookSnap.exists() ? { id: bookSnap.id, ...bookSnap.data() } : null;
                        })
                    );
                    const validBooks = bookDocs.filter(Boolean);
                    borrowing.bookItems = validBooks;
                    // Legacy compat: keep bookItem pointing to the first book
                    borrowing.bookItem = validBooks[0] || null;
                } catch (e) {
                    console.error("Error fetching books for borrowing", borrowing.id, e);
                }
            }
            return borrowing;
        }));

        return populatedBorrowings;
    } catch (error) {
        console.error("Error fetching library borrowings:", error);
        throw error;
    }
};


export const addLibraryBorrowing = async (borrowingData) => {
    try {
        // Clean bookItems from the stored data (we'll populate them on read)
        const { bookItems, selectedBooks, ...dataToSave } = borrowingData;
        const bookIds = dataToSave.bookIds || [];

        const docRef = await addDoc(collection(db, COLLECTIONS.LIBRARY_BORROWINGS), {
            ...dataToSave,
            bookIds,
            jumlah: bookIds.length,
            status: 'dipinjam',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Update all books' status to 'dipinjam'
        for (const bookId of bookIds) {
            const bookRef = doc(db, COLLECTIONS.LIBRARY_BOOKS, bookId);
            await updateDoc(bookRef, { status: 'dipinjam', updatedAt: serverTimestamp() });
        }

        return docRef.id;
    } catch (error) {
        console.error("Error adding library borrowing:", error);
        throw error;
    }
};

export const returnLibraryBorrowing = async (borrowingId, bookIds, returnDate) => {
    try {
        const borrowingRef = doc(db, COLLECTIONS.LIBRARY_BORROWINGS, borrowingId);
        await updateDoc(borrowingRef, {
            status: 'dikembalikan',
            tanggal_kembali: returnDate,
            updatedAt: serverTimestamp()
        });

        // Update all books' status back to 'tersedia'
        const ids = Array.isArray(bookIds) ? bookIds : (bookIds ? [bookIds] : []);
        for (const bookId of ids) {
            const bookRef = doc(db, COLLECTIONS.LIBRARY_BOOKS, bookId);
            await updateDoc(bookRef, { status: 'tersedia', updatedAt: serverTimestamp() });
        }
    } catch (error) {
        console.error("Error returning library borrowing:", error);
        throw error;
    }
};

export const deleteLibraryBorrowing = async (borrowingId, bookIds, status) => {
    try {
        const docRef = doc(db, COLLECTIONS.LIBRARY_BORROWINGS, borrowingId);
        await deleteDoc(docRef);

        // If the books were still 'dipinjam', set them back to 'tersedia'
        if (status === 'dipinjam') {
            const ids = Array.isArray(bookIds) ? bookIds : (bookIds ? [bookIds] : []);
            for (const bookId of ids) {
                const bookRef = doc(db, COLLECTIONS.LIBRARY_BOOKS, bookId);
                await updateDoc(bookRef, { status: 'tersedia', updatedAt: serverTimestamp() });
            }
        }
    } catch (error) {
        console.error("Error deleting library borrowing:", error);
        throw error;
    }
};
