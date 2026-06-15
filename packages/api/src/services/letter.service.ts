import { db, collections } from '../config/firebase';
import { logger } from '../config/logger';

export interface Letter {
    id: string;
    schoolId: string;
    letterNumber: string;
    referenceNumber?: string;
    letterType: string;
    formData: Record<string, any>;
    templatePath?: string;
    generatedDocPath?: string;
    generatedPdfPath?: string;
    recipientName?: string;
    recipientRole?: string;
    senderName?: string;
    senderRole?: string;
    studentId?: string;
    employeeId?: string;
    status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'archived';
    issuedDate?: string;
    approvedDate?: string;
    approvedBy?: string;
    signatures?: Array<{
        name: string;
        nip: string;
        role: string;
        signedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}

export class LetterService {
    private collection = db.collection(collections.letters);

    async getAll(filters: {
        schoolId: string;
        letterType?: string;
        status?: string;
        limit?: number;
        offset?: number;
    }) {
        try {
            let query = this.collection.where('schoolId', '==', filters.schoolId);

            if (filters.letterType) {
                query = query.where('letterType', '==', filters.letterType);
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            query = query.orderBy('createdAt', 'desc');

            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            if (filters.offset) {
                query = query.offset(filters.offset);
            }

            const snapshot = await query.get();
            const letters: Letter[] = [];

            snapshot.forEach((doc) => {
                letters.push({ id: doc.id, ...doc.data() } as Letter);
            });

            return letters;
        } catch (error) {
            logger.error('Error getting letters:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Letter | null> {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() } as Letter;
        } catch (error) {
            logger.error('Error getting letter:', error);
            throw error;
        }
    }

    async create(data: Omit<Letter, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const now = new Date();
            const docRef = await this.collection.add({
                ...data,
                status: data.status || 'draft',
                createdAt: now,
                updatedAt: now,
            });

            return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
        } catch (error) {
            logger.error('Error creating letter:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<Letter>) {
        try {
            await this.collection.doc(id).update({
                ...data,
                updatedAt: new Date(),
            });
            return this.getById(id);
        } catch (error) {
            logger.error('Error updating letter:', error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            await this.collection.doc(id).delete();
            return true;
        } catch (error) {
            logger.error('Error deleting letter:', error);
            throw error;
        }
    }

    async approve(id: string, approvedBy: string) {
        try {
            await this.collection.doc(id).update({
                status: 'approved',
                approvedBy,
                approvedDate: new Date().toISOString(),
                updatedAt: new Date(),
            });
            return this.getById(id);
        } catch (error) {
            logger.error('Error approving letter:', error);
            throw error;
        }
    }

    async getHistory(schoolId: string, limit: number = 10) {
        try {
            const snapshot = await this.collection
                .where('schoolId', '==', schoolId)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const letters: Letter[] = [];
            snapshot.forEach((doc) => {
                letters.push({ id: doc.id, ...doc.data() } as Letter);
            });

            return letters;
        } catch (error) {
            logger.error('Error getting letter history:', error);
            throw error;
        }
    }
}
