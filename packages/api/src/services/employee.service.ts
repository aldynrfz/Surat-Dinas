import { db, collections } from '../config/firebase';
import { logger } from '../config/logger';

export interface Employee {
    id: string;
    schoolId: string;
    userId?: string;
    nip: string;
    name: string;
    placeOfBirth?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female';
    address?: string;
    phone: string;
    email?: string;
    avatar?: string;
    role: string;
    rank?: string;
    grade?: string;
    employmentType?: 'PNS' | 'PPPK' | 'honor' | 'contract';
    status: 'active' | 'inactive' | 'retired';
    joinDate?: string;
    retirementDate?: string;
    yearsOfService: number;
    monthsOfService: number;
    annualLeaveBalance: number;
    bigLeaveBalance: number;
    workUnit?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}

export class EmployeeService {
    private collection = db.collection(collections.employees);

    async getAll(filters: {
        schoolId: string;
        status?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }) {
        try {
            let query = this.collection.where('schoolId', '==', filters.schoolId);

            if (filters.status) {
                query = query.where('status', '==', filters.status);
            }

            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            if (filters.offset) {
                query = query.offset(filters.offset);
            }

            const snapshot = await query.get();
            const employees: Employee[] = [];

            snapshot.forEach((doc: any) => {
                employees.push({ id: doc.id, ...doc.data() } as Employee);
            });

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                return employees.filter(
                    (e) =>
                        e.name.toLowerCase().includes(searchLower) ||
                        e.nip.includes(searchLower)
                );
            }

            return employees;
        } catch (error) {
            logger.error('Error getting employees:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Employee | null> {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) return null;
            return { id: doc.id, ...doc.data() } as Employee;
        } catch (error) {
            logger.error('Error getting employee:', error);
            throw error;
        }
    }

    async create(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) {
        try {
            const now = new Date();
            const docRef = await this.collection.add({
                ...data,
                annualLeaveBalance: data.annualLeaveBalance || 12,
                bigLeaveBalance: data.bigLeaveBalance || 0,
                yearsOfService: data.yearsOfService || 0,
                monthsOfService: data.monthsOfService || 0,
                createdAt: now,
                updatedAt: now,
            });

            return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
        } catch (error) {
            logger.error('Error creating employee:', error);
            throw error;
        }
    }

    async update(id: string, data: Partial<Employee>) {
        try {
            await this.collection.doc(id).update({
                ...data,
                updatedAt: new Date(),
            });
            return this.getById(id);
        } catch (error) {
            logger.error('Error updating employee:', error);
            throw error;
        }
    }

    async delete(id: string) {
        try {
            await this.collection.doc(id).update({
                status: 'inactive',
                updatedAt: new Date(),
            });
            return true;
        } catch (error) {
            logger.error('Error deleting employee:', error);
            throw error;
        }
    }

    async getByNip(schoolId: string, nip: string): Promise<Employee | null> {
        try {
            const snapshot = await this.collection
                .where('schoolId', '==', schoolId)
                .where('nip', '==', nip)
                .limit(1)
                .get();

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Employee;
        } catch (error) {
            logger.error('Error getting employee by NIP:', error);
            throw error;
        }
    }
}
