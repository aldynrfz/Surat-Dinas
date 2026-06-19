import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export interface UploadResult {
    driveFileId: string;
    webViewLink: string;
    fileName: string;
}

export class DriveService {
    private drive: any;
    private folderId: string;
    private isReady: boolean = false;

    constructor() {
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1EtKmGg7k04U6l8iynRD5tJk11CTY59u4';
        this.setupServiceAccount();
    }

    private setupServiceAccount() {
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;

        if (!clientEmail || !privateKey) {
            console.error('❌ GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY not set! Google Drive upload will not work.');
            return;
        }

        try {
            // Replace literal \n with actual newlines (needed when reading from env vars)
            const formattedKey = privateKey.replace(/\\n/g, '\n');

            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: clientEmail,
                    private_key: formattedKey,
                },
                scopes: SCOPES,
            });

            this.drive = google.drive({ version: 'v3', auth });
            this.isReady = true;
            console.log('✅ Drive Service Ready with Service Account');
        } catch (error) {
            console.error('❌ Error setting up Drive Service:', error);
        }
    }

    /**
     * Upload a file buffer to Google Drive folder
     */
    async uploadFile(
        fileBuffer: Buffer,
        originalName: string,
        mimeType: string
    ): Promise<UploadResult> {
        if (!this.isReady) {
            throw new Error('Drive API tidak siap. Pastikan GOOGLE_CLIENT_EMAIL dan GOOGLE_PRIVATE_KEY sudah diset di environment variables.');
        }
        const bufferStream = new Readable();
        bufferStream.push(fileBuffer);
        bufferStream.push(null);

        const safeFileName = `${Date.now()}_${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        const fileMetadata: any = {
            name: safeFileName,
            parents: [this.folderId],
        };

        // Upload file to Drive
        const uploadResponse = await this.drive.files.create({
            requestBody: fileMetadata,
            media: {
                mimeType,
                body: bufferStream,
            },
            fields: 'id, name',
            supportsAllDrives: true,
        });

        const fileId = uploadResponse.data.id!;

        // Set permission: anyone with link can view
        await this.drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });

        // Fetch the webViewLink
        const fileInfo = await this.drive.files.get({
            fileId,
            fields: 'id, webViewLink, name',
            supportsAllDrives: true,
        });

        return {
            driveFileId: fileId,
            webViewLink: fileInfo.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
            fileName: safeFileName,
        };
    }

    /**
     * Delete a file from Drive
     */
    async deleteFile(fileId: string): Promise<void> {
        await this.drive.files.delete({ 
            fileId, 
            supportsAllDrives: true 
        });
    }
}

