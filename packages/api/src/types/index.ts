// TypeScript type definitions
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}

export type UserRole = 'admin' | 'headmaster' | 'staff' | 'teacher';

export type StudentStatus = 'active' | 'graduated' | 'transferred' | 'dropped';

export type EmployeeStatus = 'active' | 'inactive' | 'retired';

export type EmploymentType = 'PNS' | 'PPPK' | 'honor' | 'contract';

export type Gender = 'male' | 'female';

export type LetterType =
    | 'active_student'
    | 'incoming_transfer'
    | 'outgoing_transfer'
    | 'recommendation'
    | 'parent_call'
    | 'good_conduct'
    | 'achievement'
    | 'assignment'
    | 'leave_request'
    | 'sppd'
    | 'research_permit'
    | 'study_permit';

export type LetterStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'archived';

export type LeaveType = 'tahunan' | 'besar' | 'sakit' | 'melahirkan' | 'penting' | 'luar_tanggungan';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
