const fs = require('fs');
const FormData = require('form-data');

async function test() {
    try {
        const form = new FormData();
        form.append('file', Buffer.from('test string'), { filename: 'test.txt', contentType: 'text/plain' });
        form.append('agendaId', '111');
        
        const response = await fetch('http://localhost:3001/api/drive/upload', {
            method: 'POST',
            body: form,
            headers: form.getHeaders ? form.getHeaders() : undefined
        });
        
        const json = await response.json();
        fs.writeFileSync('output.json', JSON.stringify(json, null, 2));
    } catch(err) {
        fs.writeFileSync('output.json', JSON.stringify({error: err.message}));
    }
}
test();
