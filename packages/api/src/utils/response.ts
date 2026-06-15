import { Response } from 'express';

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}

export const successResponse = <T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
): Response<ApiResponse<T>> => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const paginatedResponse = <T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
): Response<ApiResponse<T[]>> => {
    return res.status(200).json({
        success: true,
        message,
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
};

export const errorResponse = (
    res: Response,
    message: string,
    statusCode: number = 400
): Response<ApiResponse> => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};
