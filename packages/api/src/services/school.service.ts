import { db, collections } from '../config/firebase';
import { logger } from '../config/logger';

export interface School {
    id: string;
    nsm: string;
    name: string;
    email: string;
    phone?: string;
    logo?: string;
    headmasterName: string;
    headmasterNip: string;
    address: string;
    rtRw?: string;
    village?: string;
    district?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class SchoolService {
    private collection = db.collection(collections.schools);

    async getById(id: string): Promise<School | null> {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() } as School;
        } catch (error) {
            logger.error('Error getting school:', error);
            throw error;
        }
    }

    async getByNsm(nsm: string): Promise<School | null> {
        try {
            const snapshot = await this.collection
                .where('nsm', '==', nsm)
                .limit(1)
                .get();

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as School;
        } catch (error) {
            logger.error('Error getting school by NSM:', error);
            throw error;
        }
    }

    async create(data: Omit<School, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const now = new Date();
            const docRef = await this.collection.add({
                ...data,
                isActive: true,
                createdAt: now,
                updatedAt: now,
            });

            return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
        } catch (error) {
            logger.error('Error creating school:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<School>) {
        try {
            await this.collection.doc(id).update({
                ...data,
                updatedAt: new Date(),
            });
            return this.getById(id);
        } catch (error) {
            logger.error('Error updating school:', error);
            throw error;
        }
    }
}
