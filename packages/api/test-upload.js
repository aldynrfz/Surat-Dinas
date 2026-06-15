const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
    try {
        // Create a dummy file
        const filePath = path.join(__dirname, 'dummy.txt');
        fs.writeFileSync(filePath, 'Hello Google Drive!');

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('agendaId', 'test12345');

        console.log('Sending upload request to localhost:3001...');
        
        // We use native fetch (available in modern Node) or https/http
        // Since we are node 20+, native fetch is available
        const response = await fetch('http://localhost:3001/api/drive/upload', {
            method: 'POST',
            body: form,
            // FormData will set its own Content-Type with boundary
            headers: form.getHeaders ? form.getHeaders() : undefined
        });

        const data = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', data);

        // cleanup
        fs.unlinkSync(filePath);
    } catch (err) {
        console.error('Test script error:', err);
    }
}

testUpload();
