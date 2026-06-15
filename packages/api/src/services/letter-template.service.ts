import { db, collections } from '../config/firebase';
import { logger } from '../config/logger';

export interface LetterTemplate {
    id: string;
    schoolId?: string;
    letterType: string;
    name: string;
    description?: string;
    templatePath: string;
    thumbnailPath?: string;
    requiredFields?: Array<{
        name: string;
        type: string;
        required: boolean;
    }>;
    isSystemTemplate: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
}

export class LetterTemplateService {
    private collection = db.collection(collections.letterTemplates);

    async getAll(filters: {
        schoolId?: string;
        letterType?: string;
        isActive?: boolean;
    }) {
        try {
            let query = this.collection;

            if (filters.schoolId) {
                query = query.where('schoolId', '==', filters.schoolId) as any;
            }
            if (filters.letterType) {
                query = query.where('letterType', '==', filters.letterType) as any;
            }
            if (filters.isActive !== undefined) {
                query = query.where('isActive', '==', filters.isActive) as any;
            }

            const snapshot = await query.get();
            const templates: LetterTemplate[] = [];

            snapshot.forEach((doc: any) => {
                templates.push({ id: doc.id, ...doc.data() } as LetterTemplate);
            });

            return templates;
        } catch (error) {
            logger.error('Error getting letter templates:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<LetterTemplate | null> {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() } as LetterTemplate;
        } catch (error) {
            logger.error('Error getting letter template:', error);
            throw error;
        }
    }

    async create(data: Omit<LetterTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const now = new Date();
            const docRef = await this.collection.add({
                ...data,
                isSystemTemplate: data.isSystemTemplate || false,
                isActive: data.isActive !== undefined ? data.isActive : true,
                createdAt: now,
                updatedAt: now,
            });

            return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
        } catch (error) {
            logger.error('Error creating letter template:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<LetterTemplate>) {
        try {
            await this.collection.doc(id).update({
                ...data,
                updatedAt: new Date(),
            });
            return this.getById(id);
        } catch (error) {
            logger.error('Error updating letter template:', error);
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
            logger.error('Error deleting letter template:', error);
            throw error;
        }
    }

    async getByType(letterType: string, schoolId?: string) {
        try {
            let query = this.collection
                .where('letterType', '==', letterType)
                .where('isActive', '==', true);

            if (schoolId) {
                // Get both school-specific and system templates
                const [schoolTemplates, systemTemplates] = await Promise.all([
                    query.where('schoolId', '==', schoolId).get(),
                    query.where('isSystemTemplate', '==', true).get(),
                ]);

                const templates: LetterTemplate[] = [];
                schoolTemplates.forEach((doc) => {
                    templates.push({ id: doc.id, ...doc.data() } as LetterTemplate);
                });
                systemTemplates.forEach((doc) => {
                    templates.push({ id: doc.id, ...doc.data() } as LetterTemplate);
                });

                return templates;
            } else {
                const snapshot = await query.get();
                const templates: LetterTemplate[] = [];
                snapshot.forEach((doc) => {
                    templates.push({ id: doc.id, ...doc.data() } as LetterTemplate);
                });
                return templates;
            }
        } catch (error) {
            logger.error('Error getting templates by type:', error);
            throw error;
        }
    }
}
