import React from 'react';
import { useSchool } from '../../contexts/SchoolContext';

const stylePrint = `
@media print {
  /* 1. RESET BATASAN LAYAR APLIKASI */
  html, body, #root, div[class*="overflow-"], div[class*="flex-1"], div[class*="h-screen"] {
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    position: static !important;
  }

  /* 2. MARGIN KERTAS STANDAR RESMI */
  @page { 
    size: A4; 
    margin: 2cm 2cm 2cm 2cm; 
  }
  
  body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    background: white;
  }

  #print-section {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
  }

  /* 3. ATURAN TABEL & SPASI */
  table {
    page-break-inside: auto;
  }
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
  table td {
    vertical-align: top;
    padding-bottom: 2px;
  }

  /* 4. CLASS SAKTI ANTI-POTONG TANDA TANGAN */
  .signature-container {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    -webkit-column-break-inside: avoid !important;
    display: inline-block !important; 
    width: 100%;
  }

  /* 5. NOMOR LIST STYLING */
  ol.sip-rules {
    margin: 0;
    padding-left: 18px;
    list-style-type: decimal;
  }
  ol.sip-rules li {
    text-align: justify;
    padding-bottom: 2px;
  }
}
`;

const PrintPinjamBMN = ({ data }) => {
    const { schoolData } = useSchool();

    if (!data) return null;

    // Helper: Format Tanggal (cth: 15 Mei 2026)
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', options);
        } catch {
            return dateStr;
        }
    };

    const namaLengkap = schoolData?.nama_madrasah_lengkap || schoolData?.nama_madrasah || 'MADRASAH TSANAWIYAH NEGERI 11 TASIKMALAYA';
    const namaSekolahPendek = schoolData?.nama_madrasah || 'MTsN 11 Tasikmalaya';

    // Pre-resolve names & NIP to guarantee they appear at print
    const namaKepala = (data.nama_kepala && data.nama_kepala.trim()) || schoolData?.nama_kepala_madrasah || '';
    const nipKepala = (data.nip_kepala && data.nip_kepala.trim()) || schoolData?.nip_kepala_madrasah || '';
    const namaPeminjam = (data.nama && data.nama.trim()) || '';
    const nipPeminjam = (data.nip && data.nip.trim()) || '';

    return (
        <div
            id="print-section"
            className="print-only"
            style={{
                fontFamily: '"Arial", Helvetica, sans-serif',
                color: 'black',
                background: 'white',
                width: '100%',
                fontSize: '12pt',
                lineHeight: '1.15',
                paddingTop: '0',
                marginTop: '0'
            }}>
            <style>{stylePrint}</style>

            {/* ============ KOP SURAT ============ */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '4px double black',
                paddingBottom: '8px',
                marginBottom: '15px',
                width: '100%'
            }}>
                <div style={{ width: '100px', flexShrink: 0 }}>
                    <img
                        src="/images/logo-madrasah.png"
                        alt="Logo"
                        style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                    />
                </div>

                <div style={{
                    flex: 1,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                }}>
                    <div style={{ fontSize: '13pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                    <div style={{ fontSize: '13pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>KANTOR KEMENTERIAN AGAMA KABUPATEN TASIKMALAYA</div>
                    <div style={{ fontSize: '14pt', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {namaLengkap.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '9pt', marginTop: '4px' }}>
                        Alamat : {schoolData?.alamat_madrasah || 'Jalan Pasirjaya - Tanjungjaya Telp. (0265) 548519'}
                    </div>
                </div>

                <div style={{ width: '100px', flexShrink: 0 }}></div>
            </div>

            {/* ============ JUDUL SURAT ============ */}
            <div style={{ textAlign: 'center', marginBottom: '15px', lineHeight: '1.3' }}>
                <div style={{ fontSize: '13pt', fontWeight: 'bold', textDecoration: 'underline' }}>SURAT IZIN PEMAKAIAN BARANG MILIK NEGARA</div>
                <div style={{ fontSize: '12pt', marginTop: '2px' }}>Nomor: {data.nomor_surat || ''}</div>
            </div>

            {/* ============ PARAGRAF PEMBUKA ============ */}
            <div style={{ textAlign: 'justify', marginBottom: '12px', lineHeight: '1.3' }}>
                <p style={{ textIndent: '40px', margin: 0 }}>
                    Berdasarkan Peraturan Menteri Agama Nomor 5 tahun 2012 Tentang Tata Cara Pengadaan, Penggunaan Dan Pemeliharaan Barang Milik Negara Di Lingkungan {namaSekolahPendek}, Kuasa Pengguna Barang {namaSekolahPendek} dengan ini memberikan izin kepada :
                </p>
            </div>

            {/* ============ DATA IDENTITAS PEMINJAM ============ */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', marginLeft: '40px' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '130px', letterSpacing: '2px' }}>N a m a</td>
                        <td style={{ width: '15px' }}>:</td>
                        <td>{data.nama || ''}</td>
                    </tr>
                    <tr>
                        <td>NIP</td>
                        <td>:</td>
                        <td>{data.nip || ''}</td>
                    </tr>
                    <tr>
                        <td>Pangkat/Gol</td>
                        <td>:</td>
                        <td>{data.pangkat_golongan || ''}</td>
                    </tr>
                    <tr>
                        <td>Jabatan</td>
                        <td>:</td>
                        <td>{data.jabatan || ''}</td>
                    </tr>
                    <tr>
                        <td>Alamat</td>
                        <td>:</td>
                        <td>{data.alamat || data.alamat_lengkap || ''}</td>
                    </tr>
                </tbody>
            </table>

            {/* ============ DATA BARANG ============ */}
            <div style={{ marginBottom: '4px', lineHeight: '1.3' }}>
                Untuk mempergunakan Barang Milik Negara dengan rincian sebagai berikut :
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', marginLeft: '40px' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '130px' }}>Jenis Barang</td>
                        <td style={{ width: '15px' }}>:</td>
                        <td>{data.jenis_barang || ''}</td>
                    </tr>
                    <tr>
                        <td>Merk/Type</td>
                        <td>:</td>
                        <td>{data.merk_type || ''}</td>
                    </tr>
                    <tr>
                        <td>Warna</td>
                        <td>:</td>
                        <td>{data.warna || ''}</td>
                    </tr>
                    <tr>
                        <td>Jumlah</td>
                        <td>:</td>
                        <td>{data.jumlah || ''}</td>
                    </tr>
                    <tr>
                        <td>Kode Barang</td>
                        <td>:</td>
                        <td>{data.kode_barang || ''}</td>
                    </tr>
                    <tr>
                        <td>Tahun Perolehan</td>
                        <td>:</td>
                        <td>{data.tahun_perolehan || ''}</td>
                    </tr>
                </tbody>
            </table>

            {/* ============ KETENTUAN (9 POIN) ============ */}
            <ol className="sip-rules" style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: '11pt', lineHeight: '1.3' }}>
                <li>Barang berupa {data.jenis_barang || '{jenis_barang}'} {data.merk_type || '{merk/type}'} hanya dipergunakan untuk kepentingan dinas.</li>
                <li>Pemegang/pemakai BMN harus merawat dan memelihara kendaraan sebaik-baiknya untuk menunjang kelancaran dinas.</li>
                <li>Biaya perbaikan kerusakan dan anggaran pemeliharaan barang tersebut diatas menjadi tanggung jawab masing-masing pemakai dan bisa mengajukan bantuan dari kantor / Instansi, sepanjang anggaran masih tersedia atau memungkinkan.</li>
                <li>BMN tidak dapat/tidak boleh dipinjamkan kepada pihak lain kecuali untuk kepentingan dinas.</li>
                <li>Pemakai sanggup menyimpan, menjaga, merawat baik pada jam kerja / diluar jam kerja dan bertanggung jawab apabila terjadi kehilangan.</li>
                <li>Surat izin Pemakaian BMN ini sewaktu-waktu dapat ditarik kembali menurut kepentingan dinas dan berlaku terhadap yang bersangkutan selama menjabat.</li>
                <li>Dalam setiap mutasi pejabat/pelaksana atau pensiun pemegang BMN wajib mengembalikan kendaraan dinas instansi / unit kerja yang bersangkutan kepada pimpinan dan tidak berhak menuntut ganti rugi atas segala biaya yang pernah dikeluarkan.</li>
                <li>Setiap tahun akan diadakan pemutakhiran Surat Izin Pemakaian BMN ini, baik penggunanya masih sama ataupun sudah berbeda.</li>
                <li>Surat izin pemakaian BMN ini berlaku sejak tanggal ditetapkan.</li>
            </ol>

            {/* ============ PENUTUP & TANDA TANGAN ============ */}
            <div style={{ textAlign: 'justify', marginBottom: '10px', lineHeight: '1.3', marginTop: '10px' }}>
                Demikian, surat izin ini kami buat untuk dilaksanakan sebagaimana mestinya.
            </div>

            {/* Bungkus seluruh blok tanda tangan dalam satu tabel anti-potong (pageBreakInside: avoid) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', pageBreakInside: 'avoid' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '50%', verticalAlign: 'top', textAlign: 'left' }}>
                            <table style={{ borderCollapse: 'collapse', marginBottom: '8px' }}>
                                <tbody>
                                    <tr>
                                        <td>Ditetapkan</td>
                                        <td style={{ width: '15px', textAlign: 'center' }}>:</td>
                                        <td>Di {data.tempat_surat || 'Tasikmalaya'}</td>
                                    </tr>
                                    <tr>
                                        <td>Pada tanggal</td>
                                        <td style={{ textAlign: 'center' }}>:</td>
                                        <td>{formatDate(data.tanggal_surat)}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style={{ marginBottom: '8px' }}>Mengetahui / Menyetujui</div>
                            <div>Kuasa Pengguna Barang</div>
                        </td>
                        <td style={{ width: '50%', verticalAlign: 'bottom', textAlign: 'center' }}>
                            <div>Yang memakai</div>
                        </td>
                    </tr>

                    {/* Spasi Tanda Tangan */}
                    <tr>
                        <td style={{ height: '75px' }}></td>
                        <td style={{ height: '75px' }}></td>
                    </tr>

                    {/* Nama & NIP */}
                    <tr>
                        <td style={{ verticalAlign: 'bottom', textAlign: 'left' }}>
                            <div style={{ fontWeight: 'bold', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                                {namaKepala || '(____________________)'}
                            </div>
                            <div>NIP. {nipKepala || '............................'}</div>
                        </td>
                        <td style={{ verticalAlign: 'bottom', textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                                {namaPeminjam || '(____________________)'}
                            </div>
                            <div>NIP. {nipPeminjam || '............................'}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* ============ TEMBUSAN ============ */}
            <div style={{ marginTop: '100px', fontSize: '11pt', lineHeight: '1.3', pageBreakInside: 'avoid' }}>
                <div style={{ fontWeight: 'bold' }}>Tembusan:</div>
                <div>Yth. Kepala Kantor Wilayah Kementerian Agama Provinsi Jawa Barat</div>
                <div>Yth. Kepala Kantor Kementerian Agama Kabupaten Tasikmalaya</div>
            </div>

        </div>
    );
};

export default PrintPinjamBMN;