async function test() {
    try {
        const formData = new FormData();
        const blob = new Blob(['hello text'], { type: 'text/plain' });
        // Native fetch's FormData takes a Blob and a filename
        formData.append('file', blob, 'test.txt');
        formData.append('agendaId', '111');
        
        const response = await fetch('http://localhost:3001/api/drive/upload', {
            method: 'POST',
            body: formData,
            // DO NOT SET Content-Type. Native fetch does it automatically with boundary.
        });
        
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text);
    } catch(err) {
        console.error("Fetch failed:", err);
    }
}
test();
