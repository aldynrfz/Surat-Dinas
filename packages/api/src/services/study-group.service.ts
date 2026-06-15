import { db, collections } from '../config/firebase';
import { logger } from '../config/logger';

export interface StudyGroup {
    id: string;
    schoolId: string;
    name: string;
    level?: string;
    program?: string;
    academicYear: string;
    homeroomTeacherId?: string;
    maxCapacity: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class StudyGroupService {
    private collection = db.collection(collections.studyGroups);

    async getAll(schoolId: string) {
        try {
            const snapshot = await this.collection
                .where('schoolId', '==', schoolId)
                .where('isActive', '==', true)
                .get();

            const groups: StudyGroup[] = [];
            snapshot.forEach((doc: any) => {
                groups.push({ id: doc.id, ...doc.data() } as StudyGroup);
            });

            return groups;
        } catch (error) {
            logger.error('Error getting study groups:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<StudyGroup | null> {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() } as StudyGroup;
        } catch (error) {
            logger.error('Error getting study group:', error);
            throw error;
        }
    }

    async create(data: Omit<StudyGroup, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const now = new Date();
            const docRef = await this.collection.add({
                ...data,
                maxCapacity: data.maxCapacity || 36,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });

            return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
        } catch (error) {
            logger.error('Error creating study group:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<StudyGroup>) {
        try {
            await this.collection.doc(id).update({
                ...data,
                updatedAt: new Date(),
            });
            return this.getById(id);
        } catch (error) {
            logger.error('Error updating study group:', error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            await this.collection.doc(id).update({
                isActive: false,
                updatedAt: new Date(),
            });
            return true;
        } catch (error) {
            logger.error('Error deleting study group:', error);
            throw error;
        }
    }
}
