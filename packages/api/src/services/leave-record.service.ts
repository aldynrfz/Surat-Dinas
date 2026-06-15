import { db, collections } from '../config/firebase';
import { logger } from '../config/logger';

export interface LeaveRecord {
    id: string;
    employeeId: string;
    letterId?: string;
    leaveType: 'tahunan' | 'besar' | 'sakit' | 'melahirkan' | 'penting' | 'luar_tanggungan';
    startDate: string;
    endDate: string;
    durationDays: number;
    reason: string;
    addressDuringLeave?: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
    yearN: number;
    yearN1: number;
    yearN2: number;
    createdAt: Date;
    updatedAt: Date;
}

export class LeaveRecordService {
    private collection = db.collection(collections.leaveRecords);

    async getAll(filters: {
        employeeId?: string;
        status?: string;
        limit?: number;
        offset?: number;
    }) {
        try {
            let query = this.collection;

            if (filters.employeeId) {
                query = query.where('employeeId', '==', filters.employeeId) as any;
            }
            if (filters.status) {
                query = query.where('status', '==', filters.status) as any;
            }

            query = query.orderBy('createdAt', 'desc') as any;

            if (filters.limit) {
                query = query.limit(filters.limit) as any;
            }
            if (filters.offset) {
                query = query.offset(filters.offset) as any;
            }

            const snapshot = await query.get();
            const records: LeaveRecord[] = [];

            snapshot.forEach((doc: any) => {
                records.push({ id: doc.id, ...doc.data() } as LeaveRecord);
            });

            return records;
        } catch (error) {
            logger.error('Error getting leave records:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<LeaveRecord | null> {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() } as LeaveRecord;
        } catch (error) {
            logger.error('Error getting leave record:', error);
            throw error;
        }
    }

    async create(data: Omit<LeaveRecord, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const now = new Date();
            const docRef = await this.collection.add({
                ...data,
                status: data.status || 'pending',
                yearN: data.yearN || 0,
                yearN1: data.yearN1 || 0,
                yearN2: data.yearN2 || 0,
                createdAt: now,
                updatedAt: now,
            });

            return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
        } catch (error) {
            logger.error('Error creating leave record:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<LeaveRecord>) {
        try {
            await this.collection.doc(id).update({
                ...data,
                updatedAt: new Date(),
            });
            return this.getById(id);
        } catch (error) {
            logger.error('Error updating leave record:', error);
            throw error;
        }
    }

    async approve(id: string, approvedBy: string) {
        try {
            await this.collection.doc(id).update({
                status: 'approved',
                approvedBy,
                approvedAt: new Date(),
                updatedAt: new Date(),
            });
            return this.getById(id);
        } catch (error) {
            logger.error('Error approving leave record:', error);
            throw error;
        }
    }

    async reject(id: string, rejectionReason: string) {
        try {
            await this.collection.doc(id).update({
                status: 'rejected',
                rejectionReason,
                updatedAt: new Date(),
            });
            return this.getById(id);
        } catch (error) {
            logger.error('Error rejecting leave record:', error);
            throw error;
        }
    }

    async getByEmployee(employeeId: string) {
        try {
            const snapshot = await this.collection
                .where('employeeId', '==', employeeId)
                .orderBy('createdAt', 'desc')
                .get();

            const records: LeaveRecord[] = [];
            snapshot.forEach((doc) => {
                records.push({ id: doc.id, ...doc.data() } as LeaveRecord);
            });

            return records;
        } catch (error) {
            logger.error('Error getting employee leave records:', error);
            throw error;
        }
    }
}
