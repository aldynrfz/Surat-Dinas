const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');
const http = require('http');
const url = require('url');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

// Port untuk listener otomatis
const PORT = 3000;

fs.readFile(CREDENTIALS_PATH, (err, content) => {
  if (err) return console.log('Error membaca credentials.json:', err);
  authorize(JSON.parse(content));
});

function authorize(credentials) {
  const {client_secret, client_id} = credentials.installed || credentials.web;
  
  // Menggunakan http://localhost:PORT agar otomatis ketangkap
  const oAuth2Client = new google.auth.OAuth2(
      client_id, 
      client_secret, 
      `http://localhost:${PORT}`
  );

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log('Token sudah ada! Anda siap menggunakan API ini.');
  });
}

function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url.startsWith('/')) {
        const qs = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
        const code = qs.get('code');
        
        if (code) {
          res.end('Otentikasi berhasil! Silakan tutup tab ini dan kembali ke terminal.');
          server.close();
          
          oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error mendapatkan token:', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) return console.error(err);
              console.log('\n=============================================');
              console.log('✅ SUKSES! Token berhasil disimpan.');
              console.log('Anda bisa menutup tab browser dan menyalakan kembali');
              console.log('server backend (npm run dev).');
              console.log('=============================================\n');
              process.exit(0);
            });
          });
        } else {
          res.end('Akses Ditolak atau URL Salah.');
        }
      }
    } catch (e) {
      console.error(e);
      res.end('Error: ' + e.message);
    }
  }).listen(PORT, () => {
    console.log('=============================================');
    console.log('PENTING: Server otomatis berjalan di port ' + PORT);
    console.log('Buka link ini di browser Anda:');
    console.log('\n' + authUrl + '\n');
    console.log('Maka kode akan otomatis tercatat di terminal ini!');
    console.log('=============================================');
  });
}
