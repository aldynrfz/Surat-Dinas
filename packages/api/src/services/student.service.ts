import { db, collections } from '../config/firebase';
import { logger } from '../config/logger';

export interface Student {
    id: string;
    schoolId: string;
    nis: string;
    nisn: string;
    name: string;
    placeOfBirth?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female';
    religion?: string;
    address?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    currentClass?: string;
    studyGroupId?: string;
    admissionDate?: string;
    status: 'active' | 'graduated' | 'transferred' | 'dropped';
    parentName?: string;
    parentPhone?: string;
    parentAddress?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}

export class StudentService {
    private collection = db.collection(collections.students);

    /**
     * Get all students with optional filtering and pagination
     */
    async getAll(filters: {
        schoolId: string;
        class?: string;
        status?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }) {
        try {
            let query = this.collection.where('schoolId', '==', filters.schoolId);

            // Apply filters
            if (filters.class) {
                query = query.where('currentClass', '==', filters.class);
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            // Apply pagination
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            if (filters.offset) {
                query = query.offset(filters.offset);
            }

            const snapshot = await query.get();
            const students: Student[] = [];

            snapshot.forEach((doc) => {
                students.push({ id: doc.id, ...doc.data() } as Student);
            });

            // If search is provided, filter in memory (Firestore doesn't support full-text search natively)
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                return students.filter(
                    (s) =>
                        s.name.toLowerCase().includes(searchLower) ||
                        s.nis.includes(searchLower) ||
                        s.nisn.includes(searchLower)
                );
            }

            return students;
        } catch (error) {
            logger.error('Error getting students:', error);
            throw error;
        }
    }

    /**
     * Get student by ID
     */
    async getById(id: string): Promise<Student | null> {
        try {
            const doc = await this.collection.doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return { id: doc.id, ...doc.data() } as Student;
        } catch (error) {
            logger.error('Error getting student by ID:', error);
            throw error;
        }
    }

    /**
     * Create new student
     */
    async create(data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const now = new Date();
            const docRef = await this.collection.add({
                ...data,
                createdAt: now,
                updatedAt: now,
            });

            return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
        } catch (error) {
            logger.error('Error creating student:', error);
            throw error;
        }
    }

    /**
     * Update student
     */
    async update(id: string, data: Partial<Student>) {
        try {
            await this.collection.doc(id).update({
                ...data,
                updatedAt: new Date(),
            });

            return this.getById(id);
        } catch (error) {
            logger.error('Error updating student:', error);
            throw error;
        }
    }

    /**
     * Delete student (soft delete by setting status to 'dropped')
     */
    async delete(id: string) {
        try {
            await this.collection.doc(id).update({
                status: 'dropped',
                updatedAt: new Date(),
            });

            return true;
        } catch (error) {
            logger.error('Error deleting student:', error);
            throw error;
        }
    }

    /**
     * Search students by NIS or NISN
     */
    async search(schoolId: string, query: string) {
        try {
            const allStudents = await this.getAll({ schoolId });
            const searchLower = query.toLowerCase();

            return allStudents.filter(
                (s) =>
                    s.name.toLowerCase().includes(searchLower) ||
                    s.nis.includes(query) ||
                    s.nisn.includes(query)
            );
        } catch (error) {
            logger.error('Error searching students:', error);
            throw error;
        }
    }
}
