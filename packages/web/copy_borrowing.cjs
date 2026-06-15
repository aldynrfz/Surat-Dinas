const fs = require('fs');

let content = fs.readFileSync('src/pages/BmnBorrowingHistory.jsx', 'utf8');

content = content.replace(/bmn_borrowings/g, 'library_borrowings')
                 .replace(/BmnBorrowingHistory/g, 'LibraryBorrowingHistory')
                 .replace(/bmnList/g, 'bookList')
                 .replace(/Bmn/g, 'Library')
                 .replace(/bmnItem/g, 'bookItem')
                 .replace(/bmnId/g, 'bookId')
                 .replace(/BMN/g, 'Buku Perpustakaan')
                 .replace(/Barang Milik Negara/g, 'Buku Perpustakaan')
                 .replace(/getAllBmns/g, 'getAllLibraryBooks')
                 .replace(/bmn/g, 'buku')
                 .replace(/Buku/g, 'buku')
                 .replace(/Barang/g, 'Buku')
                 .replace(/barang/g, 'buku')
                 .replace(/\/keuangan\/buku/g, '/keuangan/perpus')
                 .replace(/nama_buku/g, 'judul_buku');

fs.writeFileSync('src/pages/LibraryBorrowingHistory.jsx', content);
console.log('Done!');
