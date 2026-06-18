import { Router, Request, Response } from 'express';
import multer from 'multer';
import { DriveService } from './drive.service';
import { logger } from '../config/logger';
import { db } from '../config/firebase';
import { config } from '../config/env';

const router = Router();
const driveService = new DriveService();

// Multer: store in memory, max 10MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipe file tidak diizinkan. Gunakan PDF, Word, JPG, atau PNG.'));
        }
    },
});

/**
 * POST /api/drive/upload
 * Upload a file to Google Drive and update Firestore agenda_surat document
 * Body: multipart/form-data { file, agendaId? }
 */
router.post('/upload', upload.array('files', 10), async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
        }

        const { agendaId } = req.body;

        logger.info(`Uploading ${files.length} files... agendaId=${agendaId}`);

        // Upload to Google Drive
        const uploadPromises = files.map(file => 
            driveService.uploadFile(file.buffer, file.originalname, file.mimetype)
        );
        const results = await Promise.all(uploadPromises);

        // Standardize output
        const newAttachments = results.map(r => ({
            attachment_url: r.webViewLink,
            drive_file_id: r.driveFileId,
            attachment_name: r.fileName,
        }));

        logger.info(`Files uploaded to Drive. Count: ${newAttachments.length}`);

        // If an agendaId is provided, update the Firestore document
        if (agendaId) {
            const docRef = db.collection('agenda_surat').doc(agendaId);
            const doc = await docRef.get();

            if (doc.exists) {
                const data = doc.data() || {};
                let currentAttachments: any[] = data.attachments || [];

                // Backward compatibility: Handle old single attachment format if array doesn't exist yet
                if (!data.attachments && data.attachment_url) {
                    currentAttachments = [{
                        attachment_url: data.attachment_url,
                        drive_file_id: data.drive_file_id,
                        attachment_name: data.attachment_name,
                    }];
                }

                await docRef.update({
                    attachments: [...currentAttachments, ...newAttachments],
                    updated_at: new Date(),
                });
                logger.info(`Firestore agenda_surat/${agendaId} updated with ${newAttachments.length} new attachments`);
            }
        }

        return res.json({
            success: true,
            data: newAttachments,
        });
    } catch (error: any) {
        logger.error('Drive upload error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Gagal mengunggah file ke Google Drive.',
            error: error.message, // Explicitly return the raw error message as requested
            stack: config.isDevelopment ? error.stack : undefined
        });
    }
});

/**
 * DELETE /api/drive/:fileId
 * Delete a file from Google Drive
 */
router.delete('/:fileId', async (req: Request, res: Response) => {
    try {
        const { fileId } = req.params;
        await driveService.deleteFile(fileId);
        return res.json({ success: true, message: 'File berhasil dihapus dari Drive.' });
    } catch (error: any) {
        logger.error('Drive delete error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Gagal menghapus file dari Drive.',
            error: error.message
        });
    }
});

export default router;
