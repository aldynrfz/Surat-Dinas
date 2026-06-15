import { google } from 'googleapis';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export interface UploadResult {
    driveFileId: string;
    webViewLink: string;
    fileName: string;
}

export class DriveService {
    private auth;
    private drive;
    private folderId: string;
    private isReady: boolean = false;

    constructor() {
        // Fix typo based on screenshot: '6l8' -> '6I8'
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1EtKmGg7k04U6l8iynRD5tJk11CTY59u4';
        
        // Setup OAuth2
        this.setupOAuth();
    }

    private setupOAuth() {
        const credentialsPath = path.resolve(__dirname, '../../credentials.json');
        const tokenPath = path.resolve(__dirname, '../../token.json');

        if (!fs.existsSync(credentialsPath)) {
            console.error('credentials.json not found! Please download from Google Cloud Console.');
            return;
        }

        if (!fs.existsSync(tokenPath)) {
            console.error('token.json not found! Please run "node generate-token.js" first.');
            return;
        }

        try {
            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

            const oAuth2Client = new google.auth.OAuth2(
                client_id, 
                client_secret, 
                redirect_uris[0]
            );

            const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
            oAuth2Client.setCredentials(token);

            // Setup token auto-refresh saving
            oAuth2Client.on('tokens', (tokens) => {
                if (tokens.refresh_token) {
                    console.log('Refreshed OAuth token received, saving...');
                    const currentTokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
                    fs.writeFileSync(tokenPath, JSON.stringify({ ...currentTokens, ...tokens }));
                }
            });

            this.auth = oAuth2Client;
            this.drive = google.drive({ version: 'v3', auth: this.auth });
            this.isReady = true;
            console.log('Drive Service Ready with OAuth 2.0');
        } catch (error) {
            console.error('Error setting up Drive Service OAuth2:', error);
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
            throw new Error('Drive API tidak siap. Pastikan credentials.json dan token.json sudah ada (baca panduan).');
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
