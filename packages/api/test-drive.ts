import { DriveService } from './src/services/drive.service';
import fs from 'fs';

async function testDrive() {
    try {
        console.log("Initializing DriveService...");
        const drive = new DriveService();
        
        console.log("Creating dummy buffer...");
        const buffer = Buffer.from('test pdf content');
        
        console.log("Uploading...");
        const result = await drive.uploadFile(buffer, 'test.pdf', 'application/pdf');
        
        console.log("Upload Success:", result);
    } catch (err: any) {
        console.error("DRIVE UPLOAD ERROR:");
        console.error(err.message);
        fs.writeFileSync('drive-test-error.log', err.toString() + "\n" + err.stack);
    }
}

testDrive();
