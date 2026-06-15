const { DriveService } = require('./dist/services/drive.service.js');
const fs = require('fs');
const path = require('path');

// Mock process.env just in case
process.env.NODE_ENV = 'development';

async function testDrive() {
    try {
        console.log("Initializing DriveService...");
        const drive = new DriveService();
        
        console.log("Creating dummy buffer...");
        const buffer = Buffer.from('test pdf content');
        
        console.log("Uploading...");
        const result = await drive.uploadFile(buffer, 'test.pdf', 'application/pdf');
        
        console.log("Upload Success:", result);
    } catch (err) {
        console.error("DRIVE UPLOAD ERROR:");
        console.error(err);
        fs.writeFileSync('drive-test-error.log', err.toString() + "\n" + err.stack);
    }
}

testDrive();
