import { LetterService, Letter } from './letter.service';
import { logger } from '../config/logger';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export class LetterGeneratorService {
    private letterService = new LetterService();
    private templateBasePath = path.join(__dirname, '../../templates/word');

    /**
     * Get template path based on letter type
     */
    private getTemplatePath(letterType: string): string {
        const templates: Record<string, string> = {
            'surat_tugas': 'surat_tugas.docx',
            'surat_keterangan': 'surat_keterangan.docx',
            'surat_keterangan_siswa_aktif': 'SURAT_KETERANGAN_SISWA_AKTIF.docx',
            // Add more template mappings as needed
        };

        const templateFile = templates[letterType] || 'SURAT_KETERANGAN_SISWA_AKTIF.docx';
        return path.join(this.templateBasePath, templateFile);
    }

    async generateWordDocument(letterId: string): Promise<Buffer> {
        try {
            const letter = await this.letterService.getById(letterId);
            if (!letter) throw new Error('Letter not found');

            const templatePath = this.getTemplatePath(letter.letterType);

            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template not found: ${templatePath}`);
            }

            const content = fs.readFileSync(templatePath, 'binary');
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            const renderData = {
                ...letter.formData,
                tanggal_surat: this.formatDate(letter.formData?.tanggal_surat),
                hari_tanggal: this.formatDate(letter.formData?.hari_tanggal),
                tgl_lahir: this.formatDate(letter.formData?.tgl_lahir),
            };

            doc.render(renderData);

            return doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
        } catch (error) {
            logger.error('Error generating generic Word document:', error);
            throw error;
        }
    }

    async generatePdfDocument(letterId: string): Promise<Buffer> {
        try {
            const wordBuffer = await this.generateWordDocument(letterId);
            return await this.convertWordToPdf(wordBuffer, letterId);
        } catch (error) {
            logger.error('Error generating generic PDF document:', error);
            throw error;
        }
    }

    /**
     * Format date for Indonesian locale
     */
    private formatDate(dateString: string): string {
        if (!dateString) return '';
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }

    async generateSiswaAktifWord(letterId: string): Promise<Buffer> {
        try {
            const letter = await this.letterService.getById(letterId);
            if (!letter) throw new Error('Letter not found');

            // Exact path as requested
            const templatePath = path.resolve(__dirname, '../../../../web/public/templates/word/SURAT_KETERANGAN_SISWA_AKTIF.docx');

            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template not found at: ${templatePath}`);
            }

            const content = fs.readFileSync(templatePath, 'binary');
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            const data = letter.formData || {};
            // Specific variable mapping for Siswa Aktif
            const renderData = {
                nomor_surat: data.nomor_surat || data.letterNumber || '',
                nama: data.nama || '',
                tempat_lahir: data.tempat_lahir || '',
                tgl_lahir: this.formatDate(data.tgl_lahir),
                nisn: data.nisn || '',
                kelas: data.kelas || '',
                nama_orangtua: data.nama_orangtua || '',
                alamat: data.alamat || '',
                nama_kepala: data.nama_kepala || '',
                nip_kepala: data.nip_kepala || ''
            };

            doc.render(renderData);

            const buffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
            logger.info(`Siswa Aktif Word generated for ${letterId}`);
            return buffer;
        } catch (error) {
            logger.error('Error generating Siswa Aktif Word:', error);
            throw error;
        }
    }

    async generateSuratTugasWord(letterId: string): Promise<Buffer> {
        try {
            const letter = await this.letterService.getById(letterId);
            if (!letter) throw new Error('Letter not found');

            const templatePath = path.resolve(__dirname, '../../../../web/public/templates/word/surat_tugas.docx');

            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template not found at: ${templatePath}`);
            }

            const content = fs.readFileSync(templatePath, 'binary');
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            const renderData = {
                ...letter.formData,
                tanggal_surat: this.formatDate(letter.formData?.tanggal_surat),
                hari_tanggal: this.formatDate(letter.formData?.hari_tanggal),
                tgl_lahir: this.formatDate(letter.formData?.tgl_lahir),
            };

            doc.render(renderData);

            const buffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
            logger.info(`Surat Tugas Word generated for ${letterId}`);
            return buffer;
        } catch (error) {
            logger.error('Error generating Surat Tugas Word:', error);
            throw error;
        }
    }

    /**
     * Generate PDF document from letter data
     * Requires LibreOffice to be installed on the system
     */
    /**
     * Helper to execute command with timeout and safety
     */
    private async executeCommand(command: string, timeout = 30000): Promise<void> {
        return new Promise((resolve, reject) => {
            const child = exec(command, { timeout }, (error, stdout, stderr) => {
                if (error) {
                    logger.warn(`Exec error for command "${command}": ${error.message}`);
                    reject(error);
                    return;
                }
                resolve();
            });

            // Safety listener
            child.on('error', (err) => {
                logger.error(`Child process error: ${err.message}`);
                reject(err);
            });
        });
    }

    private async convertWordToPdf(wordBuffer: Buffer, letterId: string): Promise<Buffer> {
        let tmpWordPath = '';
        let tmpPdfPath = '';
        const tmpDir = path.join(__dirname, '../../tmp');

        try {
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            tmpWordPath = path.join(tmpDir, `${letterId}_${Date.now()}.docx`);
            fs.writeFileSync(tmpWordPath, wordBuffer);

            const basename = path.basename(tmpWordPath, '.docx');
            tmpPdfPath = path.join(tmpDir, `${basename}.pdf`);

            const commands = [
                `soffice --headless --convert-to pdf --outdir "${tmpDir}" "${tmpWordPath}"`,
                `"C:\\Program Files\\LibreOffice\\program\\soffice.exe" --headless --convert-to pdf --outdir "${tmpDir}" "${tmpWordPath}"`
            ];

            let success = false;
            let lastError: any = null;

            for (const cmd of commands) {
                try {
                    await this.executeCommand(cmd);
                    if (fs.existsSync(tmpPdfPath)) {
                        success = true;
                        break;
                    }
                } catch (err: any) {
                    lastError = err;
                }
            }

            if (!success) {
                throw new Error(`PDF conversion failed. Last error: ${lastError?.message || 'Unknown'}`);
            }

            return fs.readFileSync(tmpPdfPath);
        } finally {
            try {
                if (tmpWordPath && fs.existsSync(tmpWordPath)) fs.unlinkSync(tmpWordPath);
                if (tmpPdfPath && fs.existsSync(tmpPdfPath)) fs.unlinkSync(tmpPdfPath);
            } catch (cleanupError) {
                logger.warn('Failed to clean up temporary files:', cleanupError);
            }
        }
    }

    async generateSiswaAktifPdf(letterId: string): Promise<Buffer> {
        try {
            const wordBuffer = await this.generateSiswaAktifWord(letterId);
            return await this.convertWordToPdf(wordBuffer, letterId);
        } catch (error) {
            logger.error('Error generating Siswa Aktif PDF:', error);
            throw error;
        }
    }

    async generateSuratTugasPdf(letterId: string): Promise<Buffer> {
        try {
            const wordBuffer = await this.generateSuratTugasWord(letterId);
            return await this.convertWordToPdf(wordBuffer, letterId);
        } catch (error) {
            logger.error('Error generating Surat Tugas PDF:', error);
            throw error;
        }
    }
}
