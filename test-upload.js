const fs = require('fs');

async function test() {
    try {
        const formData = new FormData();
        
        formData.append('agendaId', 'test12345');

        // Create a dummy file
        fs.writeFileSync('dummy.pdf', 'dummy content');
        const blob = new Blob([fs.readFileSync('dummy.pdf')], { type: 'application/pdf' });
        
        formData.append('files', blob, 'dummy.pdf');

        console.log('Sending request...');
        const res = await fetch('http://localhost:3001/api/drive/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await res.json();
        console.log('Response:', data);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (fs.existsSync('dummy.pdf')) fs.unlinkSync('dummy.pdf');
    }
}

test();
