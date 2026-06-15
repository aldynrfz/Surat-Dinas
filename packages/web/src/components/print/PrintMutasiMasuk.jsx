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

  /* 2. MARGIN KERTAS (Atas 2.5cm, Kanan 2cm, Bawah 2cm, Kiri 2cm) */
  @page { 
    size: A4; 
    margin: 2.5cm 2cm 2cm 2cm; 
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
    padding-bottom: 6px; /* Spasi antar baris biodata */
  }

  /* 4. CLASS SAKTI ANTI-POTONG TANDA TANGAN */
  .signature-container {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    -webkit-column-break-inside: avoid !important;
    display: inline-block !important; 
    width: 100%;
  }
}
`;

const PrintMutasiMasuk = ({ data }) => {
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

    return (
        <div
            id="print-section"
            className="print-only"
            style={{
                fontFamily: '"Times New Roman", Times, serif',
                color: 'black',
                background: 'white',
                width: '100%',
                fontSize: '12pt',
                lineHeight: '1.5',
                paddingTop: '0',
                marginTop: '0'
            }}>
            <style>{stylePrint}</style>

            {/* Kop Surat (Standar yang sama dengan surat lainnya) */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                borderBottom: '4px double black',
                paddingBottom: '8px',
                marginBottom: '20px',
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

            {/* Judul Surat */}
            <div style={{ textAlign: 'center', marginBottom: '30px', lineHeight: '1.2' }}>
                <div style={{ fontSize: '14pt', fontWeight: 'bold', textDecoration: 'underline' }}>SURAT KETERANGAN PENERIMAAN</div>
                <div style={{ fontSize: '12pt' }}>Nomor : {data.nomor_surat || ''}</div>
            </div>

            {/* Paragraf Pembuka */}
            <div style={{ textAlign: 'justify', marginBottom: '15px' }}>
                Yang bertanda tangan di bawah ini Kepala {schoolData?.nama_madrasah || 'MTsN 11 Tasikmalaya'} Kabupaten {schoolData?.kabupaten || 'Tasikmalaya'} menerangkan :
            </div>

            {/* Biodata Siswa */}
            <div style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '150px' }}>Nama</td>
                            <td style={{ width: '20px' }}>:</td>
                            <td style={{ fontWeight: 'bold' }}>{data.nama_siswa || ''}</td>
                        </tr>
                        <tr>
                            <td>Tempat/Tgl Lahir</td>
                            <td>:</td>
                            <td>{data.tempat_lahir || ''}, {formatDate(data.tanggal_lahir)}</td>
                        </tr>
                        <tr>
                            <td>Nama Orang Tua</td>
                            <td>:</td>
                            <td>{data.nama_orang_tua || ''}</td>
                        </tr>
                        <tr>
                            <td>NISN</td>
                            <td>:</td>
                            <td>{data.nisn || ''}</td>
                        </tr>
                        <tr>
                            <td>Alamat</td>
                            <td>:</td>
                            <td style={{ textAlign: 'justify' }}>{data.alamat || ''}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Paragraf Penutup */}
            <div style={{ textAlign: 'justify', marginBottom: '15px' }}>
                Telah diterima di Kelas {data.kelas || ''} {schoolData?.nama_madrasah || 'MTsN 11 Tasikmalaya'} pada tanggal {formatDate(data.tanggal_diterima)}.
            </div>

            <div style={{ textAlign: 'justify', marginBottom: '40px' }}>
                Demikian surat keterangan penerimaaan siswa pindahan ini dibuat, untuk dipergunakan sebagaimana mestinya.
            </div>

            {/* TANDA TANGAN (Dikunci Aman dengan Tabel & Inline-Block) */}
            <div className="signature-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '55%' }}></td> {/* Spacer kiri */}
                            <td style={{ width: '45%', textAlign: 'left' }}>
                                <div style={{ marginBottom: '5px' }}>{data.kota_surat || 'Tasikmalaya'}, {formatDate(data.tanggal_surat)}</div>
                                <div style={{ marginBottom: '60px' }}>Kepala,</div>
                                <div style={{ fontWeight: 'bold', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                                    {data.kepala_madrasah || schoolData?.nama_kepala_madrasah || ''}
                                </div>
                                <div>NIP. {data.nip_kepala || schoolData?.nip_kepala_madrasah || ''}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default PrintMutasiMasuk;