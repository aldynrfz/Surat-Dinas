import { Router, Request, Response } from 'express';
import { LetterGeneratorService } from '../services/letter-generator.service';
import { logger } from '../config/logger';

const router = Router();
const generatorService = new LetterGeneratorService();

/**
 * GET /api/letters/:id/download-word
 * Download letter as Word document
 */
router.get('/:id/download-word', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Generate Word document
        const buffer = await generatorService.generateWordDocument(id);

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="Surat_${id}.docx"`);

        // Send buffer
        res.send(buffer);

        logger.info(`Word document downloaded for letter ${id}`);
    } catch (error: any) {
        logger.error('Error downloading Word document:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate Word document',
        });
    }
});

/**
 * GET /api/letters/:id/print-pdf
 * Download letter as PDF document
 */
router.get('/:id/print-pdf', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Generate PDF document
        const buffer = await generatorService.generatePdfDocument(id);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Surat_${id}.pdf"`);

        // Send buffer
        res.send(buffer);

        logger.info(`PDF document downloaded for letter ${id}`);
    } catch (error: any) {
        logger.error('Error downloading PDF document:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate PDF document. Make sure LibreOffice is installed.',
        });
    }
});

/**
 * GET /api/letters/:id/generate-siswa-aktif/word
 */
router.get('/:id/generate-siswa-aktif/word', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const buffer = await generatorService.generateSiswaAktifWord(id);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="Surat_Siswa_Aktif_${id}.docx"`);
        res.send(buffer);
        logger.info(`Word document downloaded for letter ${id}`);
    } catch (error: any) {
        logger.error('Error downloading Word document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/letters/:id/generate-siswa-aktif/pdf
 */
router.get('/:id/generate-siswa-aktif/pdf', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const buffer = await generatorService.generateSiswaAktifPdf(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Surat_Siswa_Aktif_${id}.pdf"`);
        res.send(buffer);
        logger.info(`PDF document downloaded for letter ${id}`);
    } catch (error: any) {
        logger.error('Error downloading PDF document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/letters/:id/generate-surat-tugas/word
 */
router.get('/:id/generate-surat-tugas/word', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const buffer = await generatorService.generateSuratTugasWord(id);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="Surat_Tugas_${id}.docx"`);
        res.send(buffer);
        logger.info(`Word document downloaded for letter ${id}`);
    } catch (error: any) {
        logger.error('Error downloading Word document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/letters/:id/generate-surat-tugas/pdf
 */
router.get('/:id/generate-surat-tugas/pdf', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const buffer = await generatorService.generateSuratTugasPdf(id);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Surat_Tugas_${id}.pdf"`);
        res.send(buffer);
        logger.info(`PDF document downloaded for letter ${id}`);
    } catch (error: any) {
        logger.error('Error downloading PDF document:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
